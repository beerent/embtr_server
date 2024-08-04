import { Leaderboard } from '../dto/Leaderboard';
import { Response } from './RequestTypes';

export interface GetLeaderboardResponse extends Response {
  leaderboard?: Leaderboard;
}
