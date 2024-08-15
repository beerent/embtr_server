/* Dear future me. I have no idea what is going on here, but since you're reading this,
 * I assume you're going to make changes. Please increment this counter after your
 * (failed) attempts at optimizing. TOTAL_HOURS_WASTED_HERE: 0
 *
 * - Sydgren - 2024-03-17
 */

export class PureDate {
    private readonly year: number;
    private readonly month: number;
    private readonly day: number;

    private constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    //already in UTC timezone
    public static fromDateOnServer(date: Date): PureDate {
        return new PureDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    // use local time zone
    public static fromDateOnClient(date: Date): PureDate {
        return new PureDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    // server is utc
    public static fromDateFromServer(date: Date): PureDate {
        return new PureDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }

    public static fromTimeZone(timeone: string): PureDate {
        const date = new Date();

        const offset = date.getTimezoneOffset();
        const utc = date.getTime() + offset * 60000;
        const newDate = new Date(utc + 3600000 * Number(timeone));

        return new PureDate(
            newDate.getUTCFullYear(),
            newDate.getUTCMonth() + 1,
            newDate.getUTCDate()
        );
    }

    public static fromObject(date: any): PureDate {
        return new PureDate(date.year, date.month, date.day);
    }

    public static fromString(date: string): PureDate {
        const dateParts = date.trim().split('-');
        let year = Number(dateParts[0]);
        let month = Number(dateParts[1]);
        let day = Number(dateParts[2]);

        if (dateParts[2].length === 4) {
            year = Number(dateParts[2]);
            month = Number(dateParts[1]);
            day = Number(dateParts[0]);
        }

        return new PureDate(year, month, day);
    }

    public static fromNumbers(year: number, month: number, day: number): PureDate {
        return new PureDate(year, month, day);
    }

    public toString(): string {
        const year = this.year.toString();
        const month = this.month.toString().padStart(2, '0');
        const day = this.day.toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    public compare(other: PureDate): number {
        if (this.year !== other.year) {
            return this.year - other.year;
        }

        if (this.month !== other.month) {
            return this.month - other.month;
        }

        return this.day - other.day;
    }

    public daysApart(other: PureDate): number {
        const thisDate = new Date(this.year, this.month - 1, this.day);
        const otherDate = new Date(other.year, other.month - 1, other.day);
        const diffTime = Math.abs(thisDate.getTime() - otherDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    public toUtcDate(): Date {
        return new Date(Date.UTC(this.year, this.month - 1, this.day));
    }

    public getYear(): number {
        return this.year;
    }

    public getMonth(): number {
        return this.month;
    }

    public getDay(): number {
        return this.day;
    }
}
