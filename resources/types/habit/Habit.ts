import { Task, User } from "../../schema";
import { PureDate } from "../date/PureDate";

export interface HabitJourneys {
    user: User,
    elements: HabitJourney[]
}

export interface HabitJourney {
    level: number,
    elements: HabitJourneyElement[]
}

export interface HabitJourneyElement {
    season: number,
    seasonDate: Date,
    daysInSeason: number
}

export interface HabitSummary {
    task: Task,
    activeScheduledCount: number,
    nextActiveDays?: number,
    currentStreak: number,
}
