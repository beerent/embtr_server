import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { HabitCategoryService } from '@src/service/HabitCategoryService';
import express from 'express';

const habitRouter = express.Router();

habitRouter.get('/categories', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getAll();
    res.status(response.httpCode).json(response);
});

export default habitRouter;
