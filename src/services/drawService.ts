import prisma from '../lib/prisma';
import { Draw, Winner, draw_mode, Prisma } from '@prisma/client';

export class DrawService {
  // Create a new draw
  static async createDraw(data: Prisma.DrawCreateInput): Promise<Draw> {
    return await prisma.draw.create({
      data,
      include: {
        contest: true,
        executor: true,
        winners: {
          include: {
            participant: true,
            prize: true,
          },
        },
      },
    });
  }

  // Execute a random draw
  static async executeRandomDraw(
    contestId: number,
    executedBy: number,
    numberOfWinners: number,
    prizeIds?: number[]
  ): Promise<Draw> {
    // Get all validated participants
    const participants = await prisma.participant.findMany({
      where: {
        contestId,
        validated: true,
      },
    });

    if (participants.length === 0) {
      throw new Error('No validated participants found for this contest');
    }

    if (numberOfWinners > participants.length) {
      throw new Error('Number of winners cannot exceed number of participants');
    }

    // Create the draw record
    const draw = await prisma.draw.create({
      data: {
        contestId,
        drawMode: 'RANDOM',
        executedBy,
        totalWinners: numberOfWinners,
      },
    });

    // Randomly select winners
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, numberOfWinners);

    // Create winner records
    const winnerPromises = selectedWinners.map((participant: any, index: number) => {
      const prizeId = prizeIds && prizeIds[index] ? prizeIds[index] : null;
      
      return prisma.winner.create({
        data: {
          drawId: draw.id,
          participantId: participant.id,
          prizeId,
        },
      });
    });

    await Promise.all(winnerPromises);

    // Return the draw with winners
    return await prisma.draw.findUnique({
      where: { id: draw.id },
      include: {
        contest: true,
        executor: true,
        winners: {
          include: {
            participant: true,
            prize: true,
          },
        },
      },
    }) as Draw;
  }

  // Execute a manual draw with specific participants
  static async executeManualDraw(
    contestId: number,
    executedBy: number,
    participantIds: number[],
    prizeIds?: number[]
  ): Promise<Draw> {
    // Validate participants exist and are validated
    const participants = await prisma.participant.findMany({
      where: {
        id: { in: participantIds },
        contestId,
        validated: true,
      },
    });

    if (participants.length !== participantIds.length) {
      throw new Error('Some participants are invalid or not validated');
    }

    // Create the draw record
    const draw = await prisma.draw.create({
      data: {
        contestId,
        drawMode: 'MANUAL',
        executedBy,
        totalWinners: participantIds.length,
      },
    });

    // Create winner records
    const winnerPromises = participantIds.map((participantId, index) => {
      const prizeId = prizeIds && prizeIds[index] ? prizeIds[index] : null;
      
      return prisma.winner.create({
        data: {
          drawId: draw.id,
          participantId,
          prizeId,
        },
      });
    });

    await Promise.all(winnerPromises);

    // Return the draw with winners
    return await prisma.draw.findUnique({
      where: { id: draw.id },
      include: {
        contest: true,
        executor: true,
        winners: {
          include: {
            participant: true,
            prize: true,
          },
        },
      },
    }) as Draw;
  }

  // Get all draws for a contest
  static async getDrawsByContest(contestId: number): Promise<Draw[]> {
    return await prisma.draw.findMany({
      where: { contestId },
      include: {
        contest: true,
        executor: true,
        winners: {
          include: {
            participant: true,
            prize: true,
          },
        },
      },
      orderBy: {
        executedAt: 'desc',
      },
    });
  }

  // Get draw by ID
  static async getDrawById(id: number): Promise<Draw | null> {
    return await prisma.draw.findUnique({
      where: { id },
      include: {
        contest: true,
        executor: true,
        winners: {
          include: {
            participant: true,
            prize: true,
          },
        },
      },
    });
  }

  // Get all winners for a contest
  static async getWinnersByContest(contestId: number): Promise<Winner[]> {
    return await prisma.winner.findMany({
      where: {
        draw: {
          contestId,
        },
      },
      include: {
        participant: true,
        prize: true,
        draw: true,
      },
      orderBy: {
        draw: {
          executedAt: 'desc',
        },
      },
    });
  }

  // Update winner notification status
  static async updateWinnerNotification(
    winnerId: number,
    notified: boolean
  ): Promise<Winner> {
    return await prisma.winner.update({
      where: { id: winnerId },
      data: {
        notified,
        notifiedAt: notified ? new Date() : null,
      },
      include: {
        participant: true,
        prize: true,
        draw: true,
      },
    });
  }
}
