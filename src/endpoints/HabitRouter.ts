import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { HabitService } from '@src/service/HabitService';
import express from 'express';

const habitRouter = express.Router();

habitRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await HabitService.getAll();
    res.status(response.httpCode).json(response);
});

export default habitRouter;
