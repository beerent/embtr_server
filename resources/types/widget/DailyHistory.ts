export interface DayResult {
	date: Date;
	dayKey: string;
	complete: boolean
}

export interface DailyHistory {
	history: DayResult[]
}
