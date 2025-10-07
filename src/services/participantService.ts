import prisma from '../lib/prisma';
import { Participant, Prisma } from '@prisma/client';

export class ParticipantService {
  // Add a new participant to a contest
  static async addParticipant(data: Prisma.ParticipantCreateInput): Promise<Participant> {
    return await prisma.participant.create({
      data,
      include: {
        contest: true,
        formResponse: true,
      },
    });
  }

  // Get all participants for a contest
  static async getParticipantsByContest(contestId: number): Promise<Participant[]> {
    return await prisma.participant.findMany({
      where: { contestId },
      include: {
        contest: true,
        formResponse: true,
        winners: {
          include: {
            prize: true,
            draw: true,
          },
        },
      },
      orderBy: {
        entryTimestamp: 'desc',
      },
    });
  }

  // Get participant by ID
  static async getParticipantById(id: number): Promise<Participant | null> {
    return await prisma.participant.findUnique({
      where: { id },
      include: {
        contest: true,
        formResponse: true,
        winners: {
          include: {
            prize: true,
            draw: true,
          },
        },
      },
    });
  }

  // Get participant by unique token
  static async getParticipantByToken(token: string): Promise<Participant | null> {
    return await prisma.participant.findUnique({
      where: { uniqueToken: token },
      include: {
        contest: true,
        formResponse: true,
      },
    });
  }

  // Update participant validation status
  static async updateParticipantValidation(
    id: number,
    validated: boolean
  ): Promise<Participant> {
    return await prisma.participant.update({
      where: { id },
      data: { validated },
      include: {
        contest: true,
        formResponse: true,
      },
    });
  }

  // Get validated participants for a contest
  static async getValidatedParticipants(contestId: number): Promise<Participant[]> {
    return await prisma.participant.findMany({
      where: {
        contestId,
        validated: true,
      },
      include: {
        contest: true,
        formResponse: true,
      },
      orderBy: {
        entryTimestamp: 'asc',
      },
    });
  }

  // Check if participant already exists (by email/contact)
  static async checkDuplicateParticipant(
    contestId: number,
    contact: string
  ): Promise<Participant | null> {
    return await prisma.participant.findFirst({
      where: {
        contestId,
        contact,
      },
    });
  }

  // Get participant statistics for a contest
  static async getParticipantStats(contestId: number) {
    const stats = await prisma.participant.aggregate({
      where: { contestId },
      _count: {
        id: true,
      },
    });

    const validatedCount = await prisma.participant.count({
      where: {
        contestId,
        validated: true,
      },
    });

    return {
      total: stats._count.id,
      validated: validatedCount,
      pending: stats._count.id - validatedCount,
    };
  }
}
