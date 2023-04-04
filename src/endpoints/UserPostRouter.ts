import { CommentableType } from '@src/controller/common/CommentController';
import { LikableType } from '@src/controller/common/LikeController';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateCommentDelete, validateCommentPost } from '@src/middleware/general/GeneralValidation';
import { validateGetById, validateLike, validatePost, validateUpdate } from '@src/middleware/user_post/UserPostValidation';
import { CommentService } from '@src/service/CommentService';
import { LikeService } from '@src/service/LikeService';
import { UserPostService } from '@src/service/UserPostService';
import express from 'express';

const userPostRouter = express.Router();

userPostRouter.post('/', authenticate, authorize, validatePost, async (req, res) => {
    const response = await UserPostService.create(req);
    res.status(response.httpCode).json(response);
});

userPostRouter.get('/', authenticate, authorize, async (req, res) => {
    const response = await UserPostService.getAll();
    res.status(response.httpCode).json(response);
});

userPostRouter.get('/:id', authenticate, authorize, validateGetById, async (req, res) => {
    const id = Number(req.params.id);

    const response = await UserPostService.getById(id);
    res.status(response.httpCode).json(response);
});

userPostRouter.patch('/', authenticate, authorize, validateUpdate, async (req, res) => {
    const response = await UserPostService.update(req);
    res.status(response.httpCode).json(response);
});

userPostRouter.post('/:id/like', authenticate, authorize, validateLike, async (req, res) => {
    const response = await LikeService.create(LikableType.USER_POST, req);
    res.status(response.httpCode).json(response);
});

userPostRouter.post('/:id/comment/', authenticate, authorize, validateCommentPost, async (req, res) => {
    const response = await CommentService.create(CommentableType.USER_POST, req);
    res.status(response.httpCode).json(response);
});

userPostRouter.delete('/comment/:id', authenticate, authorize, validateCommentDelete, async (req, res) => {
    const response = await CommentService.delete(req);
    res.status(response.httpCode).json(response);
});

export default userPostRouter;
