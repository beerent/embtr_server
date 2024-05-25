import { prisma } from '@database/prisma';

export class MilestoneDao {
  public static async getAll() {
    return prisma.milestone.findMany()
  }
}
