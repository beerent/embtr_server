import { authenticate } from '@src/middleware/authentication';
import { MetadataService } from '@src/service/MetadataService';
import express from 'express';

const metadataRouter = express.Router();

metadataRouter.get('/', authenticate, async (req, res) => {
    const response = await MetadataService.getAll();
    res.status(response.httpCode).json(response);
});

export default metadataRouter;
