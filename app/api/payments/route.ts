// route.ts

import { Router } from 'express';
import { processPayment } from '../services/paymentService';

const router = Router();

router.post('/process', async (req, res) => {
    const paymentData = req.body;
    try {
        const result = await processPayment(paymentData);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error processing payment', error });
    }
});

export default router;