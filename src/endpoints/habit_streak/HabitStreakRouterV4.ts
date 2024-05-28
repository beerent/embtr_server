import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { SUCCESS } from '@src/common/RequestResponses';
import { GetHabitStreakResponse } from '@resources/types/requests/HabitTypes';
import { HabitStreakServiceV4 } from '@src/service/HabitStreakServiceV4';

const habitStreakRouterV4 = express.Router();
const v = 'v4';

habitStreakRouterV4.get('/:userId', routeLogger(v), authenticate, authorize, async (req, res) => {
  const context = await ContextService.get(req);
  const userId = Number(req.params.userId);

  const habitStreak = await HabitStreakServiceV4.getBasic(context, userId);
  const response: GetHabitStreakResponse = {
    ...SUCCESS,
    habitStreak,
  };

  res.json(response);
});

habitStreakRouterV4.get(
  '/advanced/:userId',
  routeLogger(v),
  authenticate,
  authorize,
  async (req, res) => {
    const context = await ContextService.get(req);
    const userId = Number(req.params.userId);

    const habitStreak = await HabitStreakServiceV4.getAdvanced(context, userId);
    const response: GetHabitStreakResponse = {
      ...SUCCESS,
      habitStreak,
    };

    res.json(response);
  }
);

export default habitStreakRouterV4;
