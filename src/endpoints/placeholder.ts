import express from 'express';

const placeholderRouter = express.Router();

placeholderRouter.get('/route', (req, res) => {
    res.send('test');
});

export default placeholderRouter;
