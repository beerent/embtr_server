import { Code } from '@resources/codes';
import { Award, UserAward } from '@resources/schema';
import { UserAwardDao } from '@src/database/UserAwardDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ChallengeService } from './ChallengeService';

export class UserAwardService {
    public static async addAwardFromChallenge(context: Context, challengeId: number) {
        const challenge = await ChallengeService.get(context, challengeId);
        if (!challenge.award) {
            throw new ServiceException(
                404,
                Code.RESOURCE_NOT_FOUND,
                'challenge/ challenge award not found'
            );
        }

        const award: Award = challenge.award;
        if (!award.id) {
            throw new ServiceException(
                404,
                Code.RESOURCE_NOT_FOUND,
                'challenge award id not found'
            );
        }

        return this.addAward(context, award.id);
    }

    public static async removeAwardFromChallenge(context: Context, challengeId: number) {
        const challenge = await ChallengeService.get(context, challengeId);
        if (!challenge.award) {
            throw new ServiceException(
                404,
                Code.RESOURCE_NOT_FOUND,
                'challenge/ challenge award not found'
            );
        }

        const award: Award = challenge.award;
        if (!award.id) {
            throw new ServiceException(
                404,
                Code.RESOURCE_NOT_FOUND,
                'challenge award id not found'
            );
        }

        return this.removeAward(context, award.id);
    }

    public static async removeAward(context: Context, awardId: number) {
        const userAward = await this.getByAwardId(context, awardId);
        if (!userAward) {
            return;
        }

        userAward.active = false;
        const updatedUserAward = await UserAwardDao.update(userAward);

        const updatedUserAwardModel: UserAward = ModelConverter.convert(updatedUserAward);
        return updatedUserAwardModel;
    }

    private static async addAward(context: Context, awardId: number): Promise<UserAward> {
        const userAward = await this.getByAwardId(context, awardId);

        let updatedUserAward: UserAward;
        if (userAward) {
            userAward.active = true;
            updatedUserAward = await UserAwardDao.update(userAward);
        } else {
            updatedUserAward = await UserAwardDao.create(context.userId, awardId);
        }

        return updatedUserAward;
    }

    public static async getByAwardId(
        context: Context,
        awardId: number
    ): Promise<UserAward | undefined> {
        const userAward = await UserAwardDao.get(context.userId, awardId);
        if (!userAward) {
            return undefined;
        }

        const userAwardModel: UserAward = ModelConverter.convert(userAward);
        return userAwardModel;
    }

    public static async refreshAwardsFromChallenges(context: Context) {
        const challengeParticipation = await ChallengeService.getAllChallengeParticipationForUser(
            context,
            context.userId
        );

        for (const challengeParticipant of challengeParticipation) {
            if (
                !challengeParticipant.challengeRequirementCompletionState ||
                !challengeParticipant.challengeId
            ) {
                continue;
            }

            const isComplete =
                challengeParticipant.challengeRequirementCompletionState === 'COMPLETED';

            if (isComplete) {
                await this.addAwardFromChallenge(context, challengeParticipant.challengeId);
            }
        }
    }
}
