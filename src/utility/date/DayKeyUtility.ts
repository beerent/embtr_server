export class DayKeyUtility {
    public static getDayKey(date: Date): string {
        const dateString = this.getDateFormatted(date);
        let month = dateString.split('-')[1];
        let day = dateString.split('-')[2].substring(0, 2);
        let year = dateString.split('-')[0];
        return month + day + year;
    }

    private static getDateFormatted(date: Date) {
        try {
            let month = '' + (date.getMonth() + 1),
                day = '' + date.getDate(),
                year = date.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        } catch (e) {
            console.log(e);
        }
        return '';
    }
}
