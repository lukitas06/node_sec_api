/**
 * @swagger
 * components:
 *   schemas:
 *     Register:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - age  
 *         - password  
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *         username:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico
 *         age:
 *           type: number
 *           description: Edad del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *       example:
 *         username: "Lucas"
 *         email: "lucas@email.com"
 *         age: 25
 *         password: "123456"
 * 
 *     Login:
 *      type: object
 *      required:
 *        - username
 *        - password
 *      properties:
 *        username:
 *          type: string
 *          description: Nombre de usuario
 *        password:
 *          type: string
 *          description: Contraseña del usuario
 */

import Router from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Register'
 */

// User registration
router.post('/register', async (req:Request, res:Response) => {
    try {
        const { username,email,age, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(
            { 
                name: username, 
                email,
                age,
                password: hashedPassword 
            });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión en la aplicación
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       201:
 *         description: Usuario logueado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

// User login
router.post('/login', async (req:Request, res:Response) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ name: username });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.json({ message: 'Invalid credentials' });
                return;
            }
            const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1h',
            });
            res.status(200).json({ token });
            return;
        }
        else{
            res.json({ message: 'User not found' });
        }

    } catch (error) {
        res.json({ message: error });
    }
    
});

export default router;