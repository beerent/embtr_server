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

    public static fromString(date: string): PureDate {
        const dateParts = date.trim().split('-');
        return new PureDate(
            Number(dateParts[0].trim()),
            Number(dateParts[1].trim()),
            Number(dateParts[2].trim())
        );
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
}
