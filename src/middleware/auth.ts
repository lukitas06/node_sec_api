import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import  UserDBSchema from '../models/UserDb';

interface JwtPayload {
    userId: string;
}

async function verifyToken(req:any, res:Response, next:NextFunction) {
    const token = req.header('Authorization');
    if (!token){
        res.status(401).json({ error: 'Access denied' });
        return;
    } 
    try {
        const decoded = jwt.verify(token, 'your-secret-key') as JwtPayload;
        const { cardHolder } = req.params;
        const user = await UserDBSchema.findOne({name: cardHolder});

        if (!user) {
            res.status(401).json({ error: 'User not found or without privileges' });
            return;
        }
        else if (user && user?._id.toString() != decoded.userId) {
            res.status(401).json({ error: 'User not found or without privileges' });
            return;
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default verifyToken;