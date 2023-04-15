import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';
import { WidgetType } from '@resources/schema';

export const validateUpdateUserWidgets = (req: Request, res: Response, next: NextFunction) => {
    try {
        const widgetTypeStrings: string[] = Object.values(WidgetType);

        const widgetTypeSchema = z.string().refine((value) => widgetTypeStrings.includes(value), {
            message: 'Invalid widget type',
        });

        const createSchema = z.object({
            type: widgetTypeSchema,
            order: z.coerce.number(),
        });

        const updateSchema = z.object({
            id: z.string(),
        });

        const multiSchema = z.union([createSchema, updateSchema]);

        z.object({
            widgets: z.array(multiSchema),
        }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};
