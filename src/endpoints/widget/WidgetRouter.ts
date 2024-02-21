import express from 'express';

const widgetRouter = express.Router();

widgetRouter.use('/v1/widget', widgetRouter);

//default fallback is always latest
widgetRouter.use('/:version/widget', widgetRouter);

export default widgetRouter;
