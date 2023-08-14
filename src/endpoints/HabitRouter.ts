import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import express from 'express';

const habitRouter = express.Router();

export default habitRouter;
