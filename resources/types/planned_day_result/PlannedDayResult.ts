import { Habit, PlannedDayResult} from "../../schema";

export interface CompletedHabit {
    habit: Habit,
    attempted: number,
    completed: number
}

export interface PlannedDayResultSummary {
    plannedDayResult: PlannedDayResult,
    completedHabits: CompletedHabit[]
}

