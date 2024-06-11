import { Code } from '@resources/codes';
import { Award } from '@resources/schema';
import { AwardDao } from '@src/database/AwardDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class AwardService {
    public static async create(context: Context, award: Award): Promise<Award> {
        const createdAward = await AwardDao.create(award);
        if (!createdAward) {
            throw new ServiceException(400, Code.USER_CREATE_FAILED, 'award create failed');
        }

        const awardModel: Award = ModelConverter.convert(createdAward);
        return awardModel;
    }

    public static async update(context: Context, award: Award): Promise<Award> {
        const updatedAward = await AwardDao.update(award);
        if (!updatedAward) {
            throw new ServiceException(400, Code.USER_UPDATE_FAILED, 'award update failed');
        }

        const awardModel: Award = ModelConverter.convert(updatedAward);
        return awardModel;
    }

    public static async get(context: Context, id: number): Promise<Award> {
        const award = await AwardDao.get(id);
        if (!award) {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'award not found');
        }

        const awardModel: Award = ModelConverter.convert(award);
        return awardModel;
    }
}
