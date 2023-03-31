import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetById } from '@src/middleware/user_post/UserPostValidation';
import { UserPostService } from '@src/service/UserPostService';
import express from 'express';

const userPostRouter = express.Router();

userPostRouter.get('/:id', authenticate, authorize, validateGetById, async (req, res) => {
    const id = Number(req.params.id);

    const response = await UserPostService.getById(id);
    res.status(response.httpCode).json(response);
});

export default userPostRouter;
