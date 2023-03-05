import express, { NextFunction } from 'express';
import accountRouter from './endpoints/AccountRouter';
import taskRouter from './endpoints/TaskRouter';
import bodyParser from 'body-parser';
import userRouter from './endpoints/UserRouter';
import plannedDayRouter from './endpoints/PlannedDayRouter';

const app = express();

app.use(bodyParser.json());

app.use((req, res, next): void => {
    const oldSend = res.send;
    res.send = function (this: Response, data: any): any {
        console.log(`Response for ${req.method} ${req.baseUrl}${req.path}: ${data}`);
        return oldSend.apply(this, arguments as any);
    };
    next();
});

app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/account', accountRouter);
app.use('/planned-day', plannedDayRouter);

export default app;
