import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateAddQuoteOfTheDay } from '@src/middleware/quote_of_the_day/QuoteOfTheDayValidation';
import { QuoteOfTheDayService } from '@src/service/QuoteOfTheDayService';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { validateLikePost } from '@src/middleware/general/GeneralValidation';
import { LikeService } from '@src/service/LikeService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { ContextService } from '@src/service/ContextService';
import {
    CreateQuoteOfTheDayRequest,
    CreateQuoteOfTheDayResponse,
    GetQuoteOfTheDayResponse,
} from '@resources/types/requests/QuoteOfTheDayTypes';
import { SUCCESS } from '@src/common/RequestResponses';

const quoteOfTheDayRouter = express.Router();

quoteOfTheDayRouter.post(
    '/',
    authenticate,
    authorize,
    validateAddQuoteOfTheDay,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateQuoteOfTheDayRequest = req.body;
        const quote = request.quote;
        const author = request.author;

        const quoteOfTheDay = await QuoteOfTheDayService.add(context, quote, author);
        const response: CreateQuoteOfTheDayResponse = { ...SUCCESS, quoteOfTheDay };
        res.json(response);
    })
);

quoteOfTheDayRouter.get(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);

        const quoteOfTheDay = await QuoteOfTheDayService.get(context);
        const response: GetQuoteOfTheDayResponse = { ...SUCCESS, quoteOfTheDay };
        res.json(response);
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
