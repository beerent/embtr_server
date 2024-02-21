import express from 'express';
import quoteOfTheDayRouterLatest from './QuoteOfTheDayRouterLatest';

const quoteOfTheDayRouter = express.Router();

quoteOfTheDayRouter.use('/:version/quote-of-the-day', quoteOfTheDayRouterLatest);

export default quoteOfTheDayRouter;
