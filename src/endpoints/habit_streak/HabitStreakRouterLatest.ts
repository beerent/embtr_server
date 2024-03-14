import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { HabitStreakService } from '@src/service/HabitStreakService';
import { GetHabitStreakResponse } from '@resources/types/requests/HabitTypes';

const habitStreakRouterLatest = express.Router();
const v = '✓';

habitStreakRouterLatest.get(
  '/:userId',
  routeLogger(v),
  authenticate,
  authorize,
  async (req, res) => {
    const context = await ContextService.get(req);
    const userId = Number(req.params.userId);

    const habitStreak = await HabitStreakService.get(context, userId);
    const response: GetHabitStreakResponse = {
      ...SUCCESS,
      habitStreak,
    };

    res.json(response);
  }
);

export default habitStreakRouterLatest;
