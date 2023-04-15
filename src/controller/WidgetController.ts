import { prisma } from '@database/prisma';
import { User, Widget, WidgetType } from '@resources/schema';

export class WidgetController {
    public static async get(id: number) {
        const widget = await prisma.widget.findUnique({
            where: {
                id,
            },
        });

        return widget;
    }

    public static async getAllForUser(userId: number) {
        const widgets = await prisma.widget.findMany({
            where: {
                userId,
                active: true,
            },
        });

        return widgets;
    }

    public static async create(userId: number, widget: Widget) {
        const createdWidget = await prisma.widget.create({
            data: {
                type: widget.type!,
                order: widget.order!,
                userId,
            },
        });

        return createdWidget;
    }

    public static async createAll(userId: number, widgets: Widget[]) {
        const createdWidgets = await prisma.widget.createMany({
            data: widgets.map((widget) => {
                return {
                    type: widget.type!,
                    order: widget.order!,
                    userId,
                };
            }),
        });

        return createdWidgets;
    }

    public static async update(widget: Widget) {
        const type = widget.type ? { type: widget.type } : {};
        const order = widget.order !== undefined ? { order: widget.order } : {};
        const active = widget.active !== undefined ? { active: widget.active } : {};
        const updatedWidget = await prisma.widget.update({
            data: {
                ...type,
                ...order,
                ...active,
            },
            where: {
                id: widget.id!,
            },
        });

        return updatedWidget;
    }

    public static async updateAll(widgets: Widget[]) {
        for (const widget of widgets) {
            await this.update(widget);
        }
    }

    public static async upsertAllForUser(userId: number, widgets: Widget[]) {
        const upserts = widgets.map((widget) => {
            return {
                where: widget.id !== undefined ? { id: widget.id ?? 0 } : { userId_type: { type: widget.type!, userId } },
                create: {
                    type: widget.type!,
                    order: widget.order!,
                    userId,
                },
                update: {
                    type: widget.type!,
                    order: widget.order!,
                    active: widget.active ?? true,
                },
            };
        });

        for (const upsert of upserts) {
            await prisma.widget.upsert(upsert);
        }
    }
}
