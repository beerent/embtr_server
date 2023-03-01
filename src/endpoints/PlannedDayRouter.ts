import { authenticate } from '@src/middleware/authentication';
import { authorizeGet } from '@src/middleware/planned_day/PlannedDayAuthorization';
import { PlannedDayService } from '@src/service/PlannedDayService';
import express from 'express';

const plannedDayRouter = express.Router();

plannedDayRouter.get('/:id', authenticate, authorizeGet, async (req, res) => {
    const id = req.params.id;

    const response = await PlannedDayService.get(id);
    res.status(response.httpCode).json(response);
});

export default plannedDayRouter;
