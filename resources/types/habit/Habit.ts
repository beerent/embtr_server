import { Habit, User } from "../../schema";


export interface HabitJourneys {
	user: User,
	elements: HabitJourney[]
}

export interface HabitJourney {
	habit: Habit,
	elements: HabitJourneyElement[]
}

export interface HabitJourneyElement {
	season: string,
	daysInSeason: number
}
