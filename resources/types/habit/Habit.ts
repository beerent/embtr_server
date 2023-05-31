import { Habit, User } from "../../schema";


export interface HabitJourneys {
	user: User,
	elements: HabitJourney[]
}

export interface HabitJourney {
	habit: Habit,
	level: number,
	elements: HabitJourneyElement[]
}

export interface HabitJourneyElement {
	season: number,
	seasonDate: Date,
	daysInSeason: number
}
