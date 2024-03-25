export namespace DateUtility {
    export const getToday = (): Date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return today;
    };

    export const getYesterday = (): Date => {
        const today = new Date();
        const yesterday = getDayBefore(today);

        return yesterday;
    };

    export const getDayBefore = (date: Date): Date => {
        const dayBefore = new Date(date);
        dayBefore.setDate(dayBefore.getDate() - 1);
        dayBefore.setUTCHours(0, 0, 0, 0);

        return dayBefore;
    };

    export const getDayAfter = (date: Date): Date => {
        const dayAfter = new Date(date);
        dayAfter.setDate(dayAfter.getDate() + 1);
        dayAfter.setUTCHours(0, 0, 0, 0);

        return dayAfter;
    };

    export const getOptionalDate = (date?: string) => {
        if (date) {
            return getDate(date);
        }

        return new Date();
    };

    export const getDate = (date: string): Date => {
        return new Date(date);
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
