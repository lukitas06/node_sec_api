import express, { Request, Response } from "express";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import cardRoutes from './routes/cardRoutes';
import auth from './routes/auth';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './swagger';
import {rateLimiterExpress}  from './middleware/rateLimiter';
import {customRedisRateLimiter} from './middleware/rateLimiter';

dotenv.config();
const uri = process.env.MONGO_URI || '';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware 
app.use(express.json());
// app.use(rateLimiterExpress);
app.use(customRedisRateLimiter);

// Serve Swagger documentation

//Routes
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/auth',auth);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

try {
    mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}
catch (error) {
    console.log(error);
}




