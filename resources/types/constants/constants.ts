export namespace Constants {
    export enum CompletionState {
        INVALID = 'INVALID',
        COMPLETE = 'COMPLETE',
        INCOMPLETE = 'INCOMPLETE',
        FAILED = 'FAILED',
        SKIPPED = 'SKIPPED',
        NO_SCHEDULE = 'NO_SCHEDULE',
    }

    export const getCompletionState = (state: string): CompletionState => {
        switch (state) {
            case 'COMPLETE':
                return CompletionState.COMPLETE;
            case 'INCOMPLETE':
                return CompletionState.INCOMPLETE;
            case 'FAILED':
                return CompletionState.FAILED;
            case 'SKIPPED':
                return CompletionState.SKIPPED;
            case 'NO_SCHEDULE':
                return CompletionState.NO_SCHEDULE;

            default:
                return CompletionState.INVALID;
        }
    };
}
