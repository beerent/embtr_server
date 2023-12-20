import { PlannedDayResult, Unit} from "../../schema";

export interface CompletedHabitElement {
    unit?: Unit 
    quantity: number
    completedQuantity: number
}

export interface CompletedHabit {
    elements: CompletedHabitElement[],
    scheduledHabitId: number,
    localImage?: string,
    remoteImageUrl?: string,
    attempted: number,
    completed: number
}

export interface PlannedDayResultSummary {
    plannedDayResult: PlannedDayResult,
    completedHabits: CompletedHabit[]
}

