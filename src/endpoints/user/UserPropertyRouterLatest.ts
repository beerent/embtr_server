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
    SetOperatingSystemRequest,
    SetUserReminderNotificationRequest,
    SetUserReminderNotificationResponse,
    SetUserSocialNotificationRequest,
    SetUserSocialNotificationResponse,
    SetUserTimezoneRequest,
    SetUserTimezoneResponse,
    SetUserTutorialCompletionStateRequest,
    SetUserTutorialCompletionStateResponse,
    SetUserWarningNotificationRequest,
    SetUserWarningNotificationResponse,
} from '@resources/types/requests/UserPropertyTypes';
import { CreateAwayModeRequest, GetAwayModeResponse } from '@resources/types/requests/UserTypes';
import { AwayModeService } from '@src/service/feature/AwayModeService';

const userPropertyRouterLatest = express.Router();
const v = '✓';

userPropertyRouterLatest.get(
    '/timezone',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const timezone = await UserPropertyService.getTimezone(context, context.userId);
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
        const setting = await UserPropertyService.getSocialNotification(context, context.userId);
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
        await UserPropertyService.setSocialNotification(context, context.userId, setting);
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
        const setting = await UserPropertyService.getReminderNotification(context, context.userId);
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
        await UserPropertyService.setReminderNotification(context, context.userId, setting);
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

        await UserPropertyService.setWarningNotification(context, context.userId, setting);
        const response: SetUserWarningNotificationResponse = { ...SUCCESS, setting };

        res.json(response);
    })
);

userPropertyRouterLatest.get(
    '/away/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const setting = await UserPropertyService.getAwayMode(context);
        const response: GetAwayModeResponse = { ...SUCCESS, awayMode: setting };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/away/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateAwayModeRequest = req.body;
        const awayMode = request.awayMode;

        await AwayModeService.update(context, awayMode);
        res.json(SUCCESS);
    })
);

userPropertyRouterLatest.post(
    '/tutorial/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetUserTutorialCompletionStateRequest = req.body;
        const state = request.state;

        const user = await UserPropertyService.setTutorialCompletionState(context, state);
        const response: SetUserTutorialCompletionStateResponse = { ...SUCCESS, user };

        res.json(response);
    })
);

userPropertyRouterLatest.post(
    '/operating-system/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: SetOperatingSystemRequest = req.body;
        const state = request.operatingSystem;

        const user = await UserPropertyService.setOperatingSystemState(context, state);
        const response: SetUserTutorialCompletionStateResponse = { ...SUCCESS, user };

        res.json(response);
    })
);

export default userPropertyRouterLatest;
