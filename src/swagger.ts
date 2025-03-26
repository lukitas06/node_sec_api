import { url } from 'inspector';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
    title: 'My API',
    version: '1.0.0',
    description: 'My API Description',
    },
    servers: [{

        url: 'http://localhost:3001',
    }
    ]
};

const options = {
    swaggerDefinition,

    apis: ['./src/routes/*.ts'],
};
    
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;