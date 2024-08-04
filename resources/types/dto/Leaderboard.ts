import { User } from '../../schema';

export interface LeaderboardElement {
    user: User;
    position: number;
    points: number;
}

export interface Leaderboard {
    entries: LeaderboardElement[];
}
