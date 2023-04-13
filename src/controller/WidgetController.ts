import { prisma } from '@database/prisma';
import { User, Widget, WidgetType } from '@resources/schema';

export class WidgetController {
    public static async getAllForUser(userId: number) {
        const widgets = await prisma.widget.findMany({
            where: {
                userId,
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
        const updatedWidget = await prisma.widget.update({
            data: {
                type: widget.type!,
                order: widget.order!,
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
        const creates = widgets.filter((widget) => !widget.id);
        if (creates.length > 0) {
            await this.createAll(userId, creates);
        }

        const updates = widgets.filter((widget) => widget.id);
        if (updates.length > 0) {
            await this.updateAll(updates);
        }
    }
}
