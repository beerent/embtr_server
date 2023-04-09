import express from 'express';
import accountRouter from './endpoints/AccountRouter';
import taskRouter from './endpoints/TaskRouter';
import bodyParser from 'body-parser';
import userRouter from './endpoints/UserRouter';
import plannedDayRouter from './endpoints/PlannedDayRouter';
import plannedDayResultRouter from './endpoints/PlannedDayResultRouter';
import userPostRouter from './endpoints/UserPostRouter';
import notificationRouter from './endpoints/NotificationRouter';
import dailyHistoryRouter from './endpoints/DailyHistoryRouter';
import { logger } from './common/logger/Logger';

const app = express();

app.use(bodyParser.json());

app.use((req, res, next): void => {
    const oldSend = res.send;
    res.send = function (this: Response, data: any): any {
        logger.info(`Response for ${req.method} ${req.baseUrl}${req.path}: ${data}`);
        return oldSend.apply(this, arguments as any);
    };
    next();
});

app.use('/user', userRouter);
app.use('/user', dailyHistoryRouter);
app.use('/task', taskRouter);
app.use('/account', accountRouter);
app.use('/planned-day', plannedDayRouter);
app.use('/planned-day-result', plannedDayResultRouter);
app.use('/user-post', userPostRouter);
app.use('/notification', notificationRouter);

export default app;
