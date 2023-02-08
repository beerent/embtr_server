import express from 'express';
import userRouter from './endpoints/user';
import placeholderRouter from './endpoints/placeholder';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use('/test', placeholderRouter);
app.use('/user', userRouter);

export default app;
