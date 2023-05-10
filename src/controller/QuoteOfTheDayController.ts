import { prisma } from '@database/prisma';

export class QuoteOfTheDayController {
    public static async add(userId: number, quote: string, author?: string) {
        const createdQuoteOfTheDay = await prisma.quoteOfTheDay.create({
            data: {
                quote,
                author: author,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
            include: {
                user: true,
            },
        });

        return createdQuoteOfTheDay;
    }

    public static async getById(id: number) {
        const quoteOfTheDay = await prisma.quoteOfTheDay.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
                likes: true,
            },
        });

        return quoteOfTheDay;
    }

    public static async deleteByQuote(quote: string) {
        const quoteOfTheDay = await prisma.quoteOfTheDay.deleteMany({
            where: {
                quote,
            },
        });

        return quoteOfTheDay;
    }

    public static async existsById(id: number) {
        return (await this.getById(id)) !== null;
    }
}
