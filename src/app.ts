import express from 'express';
import accountRouter from './endpoints/account';
import placeholderRouter from './endpoints/placeholder';
import bodyParser from 'body-parser';
import userRouter from './endpoints/user';

const app = express();

app.use(bodyParser.json());
app.use('/user', userRouter);
app.use('/test', placeholderRouter);
app.use('/account', accountRouter);

export default app;
