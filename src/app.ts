import express from 'express';
import accountRouter from './endpoints/AccountRouter';
import taskRouter from './endpoints/TaskRouter';
import bodyParser from 'body-parser';
import userRouter from './endpoints/UserRouter';
import plannedDayRouter from './endpoints/PlannedDayRouter';
import plannedDayResultRouter from './endpoints/PlannedDayResultRouter';
import userPostRouter from './endpoints/UserPostRouter';
import notificationRouter from './endpoints/NotificationRouter';
import widgetRouter from './endpoints/WidgetRouter';
import metadataRouter from './endpoints/MetadataRouter';
import habitRouter from './endpoints/HabitRouter';
import quoteOfTheDayRouter from './endpoints/QuoteOfTheDayRouter';
import unitRouter from '@src/endpoints/UnitRouter';
import challengeRouter from '@src/endpoints/ChallengeRouter';
import { logger } from './common/logger/Logger';
import { handleError } from './middleware/error/ErrorMiddleware';

const cors = require('cors');
const app = express();

const allowedOrigins = ['https://app.embtr.com', 'http://localhost:19006'];
app.use(
    cors({
        origin: allowedOrigins,
    })
);

app.use(bodyParser.json());

app.use((req, res, next) => {
    const startTime = Date.now();
    const oldSend = res.send;
    res.send = function (data) {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const contentLength = Buffer.byteLength(data, 'utf-8'); // Get the size of the response data'
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const requestPadding = ' '.repeat(5 - req.method.length);

        logger.info(
            //add timestamp to beginning of log
            `[${timestamp}]  ${req.method}${requestPadding}  ${res.statusCode}\t${contentLength}b\t${elapsedTime}ms\t${req.baseUrl}${req.path}`
        );
        return oldSend.apply(this, arguments as any);
    };

    next();
});

app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/account', accountRouter);
app.use('/planned-day', plannedDayRouter);
app.use('/planned-day-result', plannedDayResultRouter);
app.use('/user-post', userPostRouter);
app.use('/notification', notificationRouter);
app.use('/widget', widgetRouter);
app.use('/metadata', metadataRouter);
app.use('/habit', habitRouter);
app.use('/quote-of-the-day', quoteOfTheDayRouter);
app.use('/unit', unitRouter);
app.use('/challenge', challengeRouter);
app.use('/health', (req, res) => res.send('OK'));

app.use(handleError);

export default app;
