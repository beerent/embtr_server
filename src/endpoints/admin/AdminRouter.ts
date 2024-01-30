import express from 'express';

const adminRouter = express.Router();

adminRouter.use('/v1/admin', adminRouter);

//default fallback is always latest
adminRouter.use('/:version/admin', adminRouter);

export default adminRouter;
