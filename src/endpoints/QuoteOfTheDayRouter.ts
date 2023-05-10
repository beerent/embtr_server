import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateAddQuoteOfTheDay } from '@src/middleware/quote_of_the_day/QuoteOfTheDayValidation';
import { QuoteOfTheDayService } from '@src/service/QuoteOfTheDayService';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { validateLikePost } from '@src/middleware/general/GeneralValidation';
import { LikeService } from '@src/service/LikeService';
import { Interactable } from '@resources/types/interactable/Interactable';

const quoteOfTheDayRouter = express.Router();

quoteOfTheDayRouter.post(
    '/',
    authenticate,
    authorize,
    validateAddQuoteOfTheDay,
    runEndpoint(async (req, res) => {
        const response = await QuoteOfTheDayService.add(req);
        res.status(response.httpCode).json(response);
    })
);

quoteOfTheDayRouter.get(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await QuoteOfTheDayService.get();
        res.status(response.httpCode).json(response);
    })
);

quoteOfTheDayRouter.post(
    '/:id/like/',
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const response = await LikeService.create(Interactable.QUOTE_OF_THE_DAY, req);
        res.status(response.httpCode).json(response);
    })
);

export default quoteOfTheDayRouter;
