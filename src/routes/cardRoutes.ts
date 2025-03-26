/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       required:
 *         - number
 *         - exp_date
 *         - sec_number
 *         - card_holder  
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *         number:
 *           type: string
 *           description: Numero de la tarjeta
 *         exp_date:
 *           type: string
 *           description: Fecha de expiración
 *         sec_number:
 *           type: string
 *           description: Numero de seguridad
 *         card_holder:
 *           type: string
 *           description: Nombre del titular
 *       example:
 *         id: "123abc"
 *         number: "1234 5678 1234 5678"
 *         exp_date: "12/23"
 *         sec_number: "123"
 *         card_holder: "Lucas Alegre"
 */

import { Request, Response } from 'express';
import Card from '../models/Card';
import { Router } from 'express';
import verifyToken from '../middleware/auth';
import User from '../models/User';

const router = Router();

/**
 * @swagger
 * /api/cards/{cardHolder}:
 *   get:
 *     summary: Obtiene una tarjeta de crédito por su número
 *     tags: [Credit Cards]
 *     parameters:
 *       - in: path
 *         name: cardHolder
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del titular de la tarjeta
 *     responses:
 *       200:
 *         description: Tarjeta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Tarjeta no encontrada
 */

router.get('/:cardHolder',verifyToken, async (req: any, res: Response) => {
    try {
        const { cardHolder } = req.params;
        const card = await Card.findOne({ card_holder:cardHolder });
        res.json(card);
    } catch (error) {
        res.json({ message: error });
    }
});

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Crea una nueva tarjeta de crédito
 *     tags: [Credit Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *     responses:
 *       201:
 *         description: Tarjeta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 */

router.post('/',verifyToken, async (req: any, res: Response) => {
    const card = new Card({
        number: req.body.card_number,
        exp_date: req.body.exp_date,
        sec_number: req.body.sec_number,
        card_holder:req.body.holder
    });
    console.log(`req user id CardRoute ${req.userId}`);

    try {
        const savedCard = await card.save();
        res.json(savedCard);
    } catch (error) {
        res.json({ message: error });
    }
});

export default router;