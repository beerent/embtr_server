import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { UserPropertyService } from '@src/service/UserPropertyService';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import {
    GetUserReminderNotificationResponse,
    GetUserSocialNotificationResponse,
    GetUserTimezoneResponse,
    GetUserWarningNotificationResponse,
    SetUserReminderNotificationRequest,
    SetUserReminderNotificationResponse,
    SetUserSocialNotificationRequest,
    SetUserSocialNotificationResponse,
    SetUserTimezoneRequest,
    SetUserTimezoneResponse,
    SetUserWarningNotificationRequest,
    SetUserWarningNotificationResponse,
} from '@resources/types/requests/UserPropertyTypes';

const userPropertyRouterLatest = express.Router();
const v = '✓';

userPropertyRouterLatest.get(
    '/timezone',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const timezone = await UserPropertyService.getTimezone(context);
        const response: GetUserTimezoneResponse = { ...SUCCESS, timezone };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/timezone',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetUserTimezoneRequest = req.body;

        const timezone = request.timezone;
        await UserPropertyService.setTimezone(context, timezone);
        const response: SetUserTimezoneResponse = { ...SUCCESS, timezone };

        res.json(response);
    })
);

userPropertyRouterLatest.get(
    '/notifications/social',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const setting = await UserPropertyService.getSocialNotification(context);
        const response: GetUserSocialNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/notifications/social',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetUserSocialNotificationRequest = req.body;

        const setting = request.setting;
        await UserPropertyService.setSocialNotification(context, setting);
        const response: SetUserSocialNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.get(
    '/notifications/reminders',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const setting = await UserPropertyService.getReminderNotification(context);
        const response: GetUserReminderNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/notifications/reminders',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetUserReminderNotificationRequest = req.body;

        const setting = request.setting;
        await UserPropertyService.setReminderNotification(context, setting);
        const response: SetUserReminderNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.get(
    '/notifications/warnings',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const setting = await UserPropertyService.getWarningNotification(context);
        const response: GetUserWarningNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/notifications/warnings',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetUserWarningNotificationRequest = req.body;
        const setting = request.setting;

        await UserPropertyService.setWarningNotification(context, setting);
        const response: SetUserWarningNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

export default userPropertyRouterLatest;
