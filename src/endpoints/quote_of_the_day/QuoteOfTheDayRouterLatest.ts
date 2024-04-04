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
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { CreateLikeResponse } from '@resources/types/requests/GeneralTypes';
import { Context } from '@src/general/auth/Context';

const quoteOfTheDayRouterLatest = express.Router();
const v = '✓';

quoteOfTheDayRouterLatest.post(
    '/',
    routeLogger(v),
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

quoteOfTheDayRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);

        const quoteOfTheDay = await QuoteOfTheDayService.get(context);
        const response: GetQuoteOfTheDayResponse = { ...SUCCESS, quoteOfTheDay };
        res.json(response);
    })
);

quoteOfTheDayRouterLatest.post(
    '/:id/like/',
    routeLogger(v),
    authenticate,
    authorize,
    validateLikePost,
    runEndpoint(async (req, res) => {
        const context: Context = await ContextService.get(req);
        const interactable = Interactable.QUOTE_OF_THE_DAY;
        const targetId = parseInt(req.params.id);

        const like = await LikeService.create(context, interactable, targetId);

        const response: CreateLikeResponse = { ...SUCCESS, like };
        res.status(response.httpCode).json(response);
    })
);

export default quoteOfTheDayRouterLatest;
