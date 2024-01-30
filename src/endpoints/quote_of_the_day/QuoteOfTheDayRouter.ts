import express from 'express';
import quoteOfTheDayRouterV1 from '@src/endpoints/quote_of_the_day/QuoteOfTheDayRouterV1';

const quoteOfTheDayRouter = express.Router();

quoteOfTheDayRouter.use('/v1/quote-of-the-day', quoteOfTheDayRouterV1);

//default fallback is always latest
quoteOfTheDayRouter.use('/:version/quote-of-the-day', quoteOfTheDayRouterV1);

export default quoteOfTheDayRouter;
