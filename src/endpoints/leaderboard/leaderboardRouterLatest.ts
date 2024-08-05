import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { LeaderboardService } from '@src/service/feature/LeaderboardService';
import { Constants } from '@resources/types/constants/constants';
import { GetLeaderboardResponse } from '@resources/types/requests/Leaderboard';
import { SUCCESS } from '@src/common/RequestResponses';

const leaderboardRouterLatest = express.Router();
const v = '✓';

leaderboardRouterLatest.get(
  '/:type/',
  routeLogger(v),
  authenticate,
  authorize,
  async (req, res) => {
    const context = await ContextService.get(req);
    const type = Constants.getLeaderboardType(req.params.type.toUpperCase());

    const leaderboard = await LeaderboardService.get(context, type);
    const response: GetLeaderboardResponse = { ...SUCCESS, leaderboard };
    res.json(response);
  }
);

export default leaderboardRouterLatest;
