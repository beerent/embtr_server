import express from 'express';

const healthRouter = express.Router();

healthRouter.use('/:version/health', (req, res) => res.send('OK'));
healthRouter.use('/health', (req, res) => res.send('OK'));

export default healthRouter;
