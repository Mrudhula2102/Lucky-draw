import prisma from '../lib/prisma';
import { Prize, Prisma } from '@prisma/client';

export class PrizeService {
  // Create a new prize
  static async createPrize(data: Prisma.PrizeCreateInput): Promise<Prize> {
    return await prisma.prize.create({
      data,
      include: {
        contest: true,
        winners: {
          include: {
            participant: true,
          },
        },
      },
    });
  }

  // Get all prizes for a contest
  static async getPrizesByContest(contestId: number): Promise<Prize[]> {
    return await prisma.prize.findMany({
      where: { contestId },
      include: {
        contest: true,
        winners: {
          include: {
            participant: true,
          },
        },
      },
      orderBy: {
        value: 'desc',
      },
    });
  }

  // Get prize by ID
  static async getPrizeById(id: number): Promise<Prize | null> {
    return await prisma.prize.findUnique({
      where: { id },
      include: {
        contest: true,
        winners: {
          include: {
            participant: true,
          },
        },
      },
    });
  }

  // Update prize
  static async updatePrize(
    id: number,
    data: Prisma.PrizeUpdateInput
  ): Promise<Prize> {
    return await prisma.prize.update({
      where: { id },
      data,
      include: {
        contest: true,
        winners: {
          include: {
            participant: true,
          },
        },
      },
    });
  }

  // Delete prize
  static async deletePrize(id: number): Promise<Prize> {
    return await prisma.prize.delete({
      where: { id },
    });
  }

  // Get available prizes (not yet won or with remaining quantity)
  static async getAvailablePrizes(contestId: number): Promise<Prize[]> {
    const prizes = await prisma.prize.findMany({
      where: { contestId },
      include: {
        winners: true,
      },
    });

    // Filter prizes that still have available quantity
    return prizes.filter((prize: any) => {
      const wonCount = prize.winners.length;
      return wonCount < prize.quantity;
    });
  }

  // Get prize statistics
  static async getPrizeStats(contestId: number) {
    const prizes = await prisma.prize.findMany({
      where: { contestId },
      include: {
        winners: true,
      },
    });

    const totalPrizes = prizes.reduce((sum: number, prize: any) => sum + prize.quantity, 0);
    const wonPrizes = prizes.reduce((sum: number, prize: any) => sum + prize.winners.length, 0);
    const totalValue = prizes.reduce((sum: number, prize: any) => {
      const prizeValue = prize.value ? parseFloat(prize.value.toString()) : 0;
      return sum + (prizeValue * prize.quantity);
    }, 0);

    return {
      totalPrizes,
      wonPrizes,
      availablePrizes: totalPrizes - wonPrizes,
      totalValue,
      prizeCount: prizes.length,
    };
  }
}
