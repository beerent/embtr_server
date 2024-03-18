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

    export const getAllDatesInBetween = (startDate: Date, endDate: Date): Date[] => {
        const dates = [];
        let currentDate = new Date(startDate);
        currentDate.setUTCHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };
}
