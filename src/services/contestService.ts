import prisma from '../lib/prisma';
import { Contest, contest_status, Prisma } from '@prisma/client';

export class ContestService {
  // Create a new contest
  static async createContest(data: Prisma.ContestCreateInput): Promise<Contest> {
    return await prisma.contest.create({
      data,
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
      },
    });
  }

  // Get all contests
  static async getAllContests(): Promise<Contest[]> {
    return await prisma.contest.findMany({
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
        _count: {
          select: {
            participants: true,
            prizes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get contest by ID
  static async getContestById(id: number): Promise<Contest | null> {
    return await prisma.contest.findUnique({
      where: { id },
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
        draws: {
          include: {
            winners: {
              include: {
                participant: true,
                prize: true,
              },
            },
          },
        },
      },
    });
  }

  // Update contest
  static async updateContest(
    id: number,
    data: Prisma.ContestUpdateInput
  ): Promise<Contest> {
    return await prisma.contest.update({
      where: { id },
      data,
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
      },
    });
  }

  // Delete contest
  static async deleteContest(id: number): Promise<Contest> {
    return await prisma.contest.delete({
      where: { id },
    });
  }

  // Get contests by status
  static async getContestsByStatus(status: contest_status): Promise<Contest[]> {
    return await prisma.contest.findMany({
      where: { status },
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get active contests (ongoing)
  static async getActiveContests(): Promise<Contest[]> {
    const now = new Date();
    return await prisma.contest.findMany({
      where: {
        AND: [
          { startDate: { lte: now } },
          { endDate: { gte: now } },
          { status: 'ONGOING' },
        ],
      },
      include: {
        creator: true,
        entryForm: true,
        prizes: true,
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
