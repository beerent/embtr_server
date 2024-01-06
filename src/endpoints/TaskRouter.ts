import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateSearch as validateSearchTasks } from '@src/middleware/task/TaskValidation';
import { HabitService } from '@src/service/HabitService';
import express from 'express';
import { validateScheduledHabitGet } from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { ContextService } from '@src/service/ContextService';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';

const taskRouter = express.Router();

export default taskRouter;
