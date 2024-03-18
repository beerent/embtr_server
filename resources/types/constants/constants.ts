export namespace Constants {
    export enum HabitStatus {
        INVALID = 'invalid',
        INCOMPLETE = 'INCOMPLETE',
        COMPLETE = 'COMPLETE',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
    }

    export enum CompletionState {
        INVALID = 'INVALID',
        INCOMPLETE = 'INCOMPLETE',
        COMPLETE = 'COMPLETE',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
    }

    export const getCompletionState = (value: string) => {
        switch (value) {
            case 'COMPLETE':
                return CompletionState.COMPLETE;
            case 'FAILED':
                return CompletionState.FAILED;
            case 'SKIPPED':
                return CompletionState.SKIPPED;
        }

        return CompletionState.INVALID;
    };
}
