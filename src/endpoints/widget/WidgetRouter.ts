import express from 'express';
import userPostRouterV1 from '@src/endpoints/user_post/UserPostRouterV1';

const widgetRouter = express.Router();

widgetRouter.use('/v1/widget', widgetRouter);

//default fallback is always latest
widgetRouter.use('/:version/widget', widgetRouter);

export default widgetRouter;
