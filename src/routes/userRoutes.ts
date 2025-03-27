/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - age    
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico
 *         age:
 *           type: number
 *           description: Edad del usuario
 *       example:
 *         name: "Lucas Alegre"
 *         email: "lucas@example.com"
 *         age: 25
 *         password: "123456"
 */

import { Request, Response } from 'express';
import User from '../models/User';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        res.json({ message: error });
    }
});


export default router;