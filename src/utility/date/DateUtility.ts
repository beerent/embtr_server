export namespace DateUtility {
    export const getToday = (): Date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return today;
    };

    export const getYesterday = (): Date => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);

        return yesterday;
    };

    export const getOptionalDate = (date?: string) => {
        if (date) {
            return new Date(date);
        }

        return new Date();
    };
}
