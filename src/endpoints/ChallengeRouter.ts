import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ChallengeService } from '@src/service/ChallengeService';
import { validateChallengeRegister } from '@src/middleware/challenge/ChallengeValidation';

const challengeRouter = express.Router();

challengeRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await ChallengeService.getAll();
    res.status(response.httpCode).json(response);
});

challengeRouter.post(
    '/:id/register',
    authenticate,
    authorize,
    validateChallengeRegister,
    async (req, res) => {
        const response = await ChallengeService.register(req);
        res.status(response.httpCode).json(response);
    }
);

export default challengeRouter;
