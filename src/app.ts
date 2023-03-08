import express from 'express';
import accountRouter from './endpoints/AccountRouter';
import taskRouter from './endpoints/TaskRouter';
import bodyParser from 'body-parser';
import userRouter from './endpoints/UserRouter';
import plannedDayRouter from './endpoints/PlannedDayRouter';
import { logger } from './common/logger/Logger';

const app = express();

app.use(bodyParser.json());

app.use((req, res, next): void => {
    const oldSend = res.send;
    res.send = function (this: Response, data: any): any {
        logger.debug(`Response for ${req.method} ${req.baseUrl}${req.path}: ${data}`);
        return oldSend.apply(this, arguments as any);
    };
    next();
});

app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/account', accountRouter);
app.use('/planned-day', plannedDayRouter);

export default app;
