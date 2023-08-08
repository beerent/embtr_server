import { Habit, PlannedDayResult, Unit} from "../../schema";

export interface CompletedHabitElement {
    unit?: Unit 
    quantity: number
    completedQuantity: number
}

export interface CompletedHabit {
    habit: Habit,
    elements: CompletedHabitElement[],
    attempted: number,
    completed: number
}

export interface PlannedDayResultSummary {
    plannedDayResult: PlannedDayResult,
    completedHabits: CompletedHabit[]
}

