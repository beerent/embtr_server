import { Comment, Image, Like } from '@resources/schema';

export class CommonUpserts {
    /*
     * CREATES
     */
    public static createImagesInserts(images: Image[]) {
        return {
            create: images.map((image) => ({
                url: image.url ?? '',
            })),
        };
    }

    public static createLikesInserts(likes: Like[]) {
        return {
            create: likes?.map((like) => ({
                user: {
                    connect: {
                        id: like.userId!,
                    },
                },
            })),
        };
    }

    public static createCommentsInserts(comments: Comment[]) {
        return {
            create: comments?.map((comment) => ({
                comment: comment.comment ?? '',
                user: {
                    connect: {
                        id: comment.userId!,
                    },
                },
            })),
        };
    }

    public static createCommentInserts(comment: Comment) {
        return {
            create: {
                comment: comment.comment ?? '',
                user: {
                    connect: {
                        id: comment.userId!,
                    },
                },
            },
        };
    }

    /*
     * UPSERTS
     */
    public static createImagesUpserts(images: Image[]) {
        return {
            upsert: images
                ?.filter((image) => image.url !== undefined)
                .map((image) => ({
                    where: { id: image.id ?? -1 },
                    create: { url: image.url! },
                    update: { url: image.url!, active: image.active ?? true },
                })),
        };
    }

    public static createLikesUpserts(likes: Like[]) {
        const result = {
            upsert: likes
                ?.filter((like) => like.userId !== undefined)
                .map((like) => ({
                    where: { id: like.id ?? -1 },
                    create: {
                        user: {
                            connect: {
                                id: like.userId,
                            },
                        },
                    },
                    update: {
                        active: like.active ?? true,
                    },
                })),
        };

        return result;
    }

    public static createCommentsUpserts(comments: Comment[]) {
        const result = {
            upsert: comments
                .filter((comment) => comment.userId !== undefined)
                .map((comment) => ({
                    where: { id: comment.id ?? -1 },
                    create: {
                        comment: comment.comment ?? '',
                        user: {
                            connect: {
                                id: comment.userId,
                            },
                        },
                    },
                    update: {
                        comment: comment.comment ?? '',
                        active: comment.active ?? true,
                    },
                })),
        };

        return result;
    }
}
