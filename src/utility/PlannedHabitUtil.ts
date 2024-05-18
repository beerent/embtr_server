import { PlannedTask } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class PlannedHabitUtil {
    public static isComplete(plannedHabit: PlannedTask): boolean {
        return this.isCompleteStatus(plannedHabit) || this.isCompleteQuantity(plannedHabit);
    }

    public static isSkipped(plannedHabit: PlannedTask): boolean {
        return plannedHabit.status === Constants.CompletionState.SKIPPED;
    }

    public static isFailed(plannedHabit: PlannedTask): boolean {
        return plannedHabit.status === Constants.CompletionState.FAILED;
    }

    public static isFinished(plannedHabit: PlannedTask): boolean {
        return (
            this.isComplete(plannedHabit) ||
            this.isSkipped(plannedHabit) ||
            this.isFailed(plannedHabit)
        );
    }

    public static isChallenge(plannedHabit: PlannedTask): boolean {
        return plannedHabit?.scheduledHabit?.task?.type === 'CHALLENGE';
    }

    private static isCompleteStatus(plannedHabit: PlannedTask): boolean {
        return plannedHabit.status === Constants.CompletionState.COMPLETE;
    }

    private static isCompleteQuantity(plannedHabit: PlannedTask): boolean {
        return (plannedHabit.completedQuantity ?? 0) >= (plannedHabit.quantity ?? 1);
    }
}
