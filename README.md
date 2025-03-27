# node_sec_api
This is an example of a secure API made in node.js

# Steps for creating the API
## Starting API
Follow the steps listed in this post: 
[Notion post](https://medium.com/@holasoymalva/how-to-build-a-rest-api-with-node-js-and-typescript-3491ddd19f95)

## Integration with MongoDB
To integrate the MongoDb into this proyect we need to install some dependencies:
```
npm install mongodb
npm install mongoose
```
- First you need to create a MongoDb atlas account.
- Then you need to create a cluster and a database.
- In the cluster, mongo gives you the instructions to connect to the database from the Javascript code.
- Copy the connection string and create an environment variable.
- In the index.ts file:
```
import mongoose from 'mongoose'
```
and
```
mongoose.connect(<mongo_uri>)
```
You can try-catch this connection and wait until the connection is made to start the server listening.
- Then you need to create a model for each Schema you are using in your database. These are located in the /models folder.
- Then, in each route handler or controller, you need to import the model and use it to make CRUD operations.

For each step look at the /models and /routes folder and index.ts file if necessary.

## Integration with Swagger
Refer to [API Doc with Swagger](https://medium.com/@samuelnoye35/simplifying-api-development-in-node-js-with-swagger-a5021ac45742) to make this integration.
Remember to install these dependencies:
```
npm install swagger-jsdoc swagger-ui-express
```
## Authorization and authentication with JWT
In order to use JWT to authenticate and authorize the different users, we need to install the dependency with
```
npm install jsonwebtoken
```
- It is necessary to create a route to register and login users to the API (see the source code).
A token work as follows:
- When a registered user log in to the application (frontend), a request to the registration route is made. This service or controller create the user (santizing all the inputs) and hash the password field, to insert it in the database.
- Then, when a user log in to the application, the backend checks the user and password matches the data stored in the database (dehashing and comparing passwords). If the check is ok, a token is generated and passed to the frontend.
- For each subsequent request for accessing data in the database, the tokenn is sent in the headers. The backend (often a middleware function) verify this token and allows/deny the operation.
    - It is important that this process not only checks the signature of the token (the validity) but also check that the user who is pretending to make this operation, is the same user listed in the token fields. This is because a authenticated user could impersonate some other and make and operation that does not correspond to him.

 ## Rate limiting
 Rate limiting is a tecnique that is used to control how many requests a user can make in a timelapse. This can avoid a user to overuse the endpoint and consuming all the resources.

 There are several ways to implement rate limiting. See [Types of Rate Limiting](https://blog.logrocket.com/rate-limiting-node-js/#how-to-implement-rate-limiting-node-js) to understand pros and cons of each type.

We are going to implement sliding window counter and tocken bucket because these are the most effective.
### Sliding Window Counter with third-party
 A third-party library will be used in this proyect called Express Rate Limit. You can download it in your proyect with
```
npm install express-rate-limit --save
```
This rate limit option is very simple to configure, only a few lines of code in the middleware file:

/middlewares/rateLimiter.ts
```
import rateLimit from "express-rate-limit";

export const rateLimiterExpress = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 100,
    message: 'You have exceeded the 100 requests in 24 hrs limit!', 
    standardHeaders: true,
    legacyHeaders: false,
});

export default rateLimiterExpress;
```
and two lines in the index.ts file:
```
import rateLimiterExpress  from './middleware/rateLimiter';

app.use(rateLimiterExpress);
```

### Custom Sliding Window with Redis 
Redis is a key/value in-memory storage that is used as cache in web applications or databases. Allows a fast request/response of data.
In the Sliding Window technique, the user’s requests are grouped by timestamp, and rather than log each request, we keep a counter for each group.
For each user request, we need to check if a record exist in the current timestamp, and create one if not exists.
To allow/deny the ingoing request we need to work with the previous and actual timestamp. A weight for the current window is calculated: 
rate = previous * ((stamp - actual)/stamp) + current
- previous = number of requests made in previous timestamp
- stamp = timestamp configured (window)
- actual = time elapsed of the current timestamp
- current = number of requests made in current timestamp

If the rate is equal to the limit of requests in the timestamp, the request is ignored and an error is triggered.
