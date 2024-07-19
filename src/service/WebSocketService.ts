import { Constants } from '@resources/types/constants/constants';
import { LevelDetails } from '@resources/types/dto/Level';
import { WebSocketPayload } from '@resources/types/requests/WebSocket';
import { logger } from '@src/common/logger/Logger';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Context } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';
import http from 'http';
import { Server } from 'socket.io';

// Broseidon has entered the chat. - TheCaptainCoder - 2024-07-12

export class WebSocketService {
    private static io: Server;

    public static init(server: http.Server) {
        if (this.io) {
            return;
        }

        this.io = new Server(server);
        this.addAuthMiddleware(this.io);
        this.addConnectionListener(this.io);
    }

    public static emitFireConfetti(context: Context) {
        if (!this.roomExists(context)) {
            return;
        }

        const payload: WebSocketPayload = {};

        this.emit(
            this.getRoomKey(context.userId),
            Constants.WebSocketEventType.FIRE_CONFETTI,
            payload
        );
    }

    public static emitPlannedDayComplete(context: Context, dayKey: string) {
        if (!this.roomExists(context)) {
            return;
        }

        const payload: WebSocketPayload = {
            payload: {
                dayKey,
            },
        };

        this.emit(
            this.getRoomKey(context.userId),
            Constants.WebSocketEventType.DAY_COMPLETE,
            payload
        );
    }

    public static emitHabitStreakUpdated(context: Context) {
        if (!this.roomExists(context)) {
            return;
        }

        const payload: WebSocketPayload = {};

        this.emit(
            this.getRoomKey(context.userId),
            Constants.WebSocketEventType.HABIT_STREAK_UPDATED,
            payload
        );
    }

    public static emitLevelDetailsUpdated(context: Context, levelDetails: LevelDetails) {
        if (!this.roomExists(context)) {
            return;
        }

        const payload: WebSocketPayload = {
            payload: {
                levelDetails,
            },
        };

        this.emit(
            this.getRoomKey(context.userId),
            Constants.WebSocketEventType.LEVEL_DETAILS_UPDATED,
            payload
        );
    }

    private static emit(
        roomKey: string,
        eventType: Constants.WebSocketEventType,
        payload: WebSocketPayload
    ) {
        this.logEmitEvent(eventType);
        this.io.to(roomKey).emit(eventType, payload);
    }

    private static addAuthMiddleware(io: Server) {
        io.use(async (socket, next) => {
            console.log('authing');
            const token = socket.handshake.query.token;
            if (!token || typeof token !== 'string') {
                console.log('no token');
                return next(new Error('Unauthorized'));
            }

            const userId = await AuthorizationDao.getUserIdFromToken(token);
            if (!userId) {
                console.log('no user id');
                return next(new Error('Unauthorized'));
            }

            const userRoles = await AuthorizationDao.getRolesFromToken(token);
            if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
                console.log('not admin or user');
                return next(new Error('Unauthorized'));
            }

            console.log('user is authed');
            next();
        });
    }

    private static addConnectionListener(io: Server) {
        io.on('connection', async (socket) => {
            const token = socket.handshake.query.token;

            if (!token || typeof token !== 'string') {
                socket.disconnect();
                return;
            }

            // at this point we are authed via jwt and I know the user's uid and id
            const userId = await AuthorizationDao.getUserIdFromToken(token);
            if (!userId) {
                socket.disconnect();
                return;
            }

            const roomKey = 'user:room:' + userId;
            socket.join(roomKey);
        });
    }

    private static roomExists(context: Context) {
        const roomKeys = this.getRoomKey(context.userId);
        return this.io.sockets.adapter.rooms.has(roomKeys);
    }

    private static getRoomKey(userId: number) {
        return 'user:room:' + userId;
    }

    private static logEmitEvent(eventType: Constants.WebSocketEventType) {
        logger.info(`[EMITTING] - event ${eventType}`);
    }
}
