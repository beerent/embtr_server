import { Milestone } from "@resources/schema";
import { MilestoneDao } from "@src/database/MilestoneDao";
import { ModelConverter } from "@src/utility/model_conversion/ModelConverter";

export class MilestoneService {
  public static async getAll(): Promise<Milestone[]> {
    const milestones = await MilestoneDao.getAll()
    const milestoneModels: Milestone[] = ModelConverter.convertAll(milestones)

    return milestoneModels
  }
}
