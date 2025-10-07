import prisma from '../lib/prisma';
import { Form, FormResponse, Prisma } from '@prisma/client';

export class FormService {
  // Create a new form
  static async createForm(data: Prisma.FormCreateInput): Promise<Form> {
    return await prisma.form.create({
      data,
      include: {
        contests: true,
        responses: true,
      },
    });
  }

  // Get form by ID
  static async getFormById(id: number): Promise<Form | null> {
    return await prisma.form.findUnique({
      where: { id },
      include: {
        contests: true,
        responses: {
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });
  }

  // Get all forms
  static async getAllForms(): Promise<Form[]> {
    return await prisma.form.findMany({
      include: {
        contests: true,
        responses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Update form
  static async updateForm(
    id: number,
    data: Prisma.FormUpdateInput
  ): Promise<Form> {
    return await prisma.form.update({
      where: { id },
      data,
      include: {
        contests: true,
        responses: true,
      },
    });
  }

  // Delete form
  static async deleteForm(id: number): Promise<Form> {
    return await prisma.form.delete({
      where: { id },
    });
  }

  // Submit form response
  static async submitFormResponse(
    formId: number,
    responseData: any
  ): Promise<FormResponse> {
    return await prisma.formResponse.create({
      data: {
        formId,
        responseData,
      },
      include: {
        form: true,
        participants: true,
      },
    });
  }

  // Get form responses
  static async getFormResponses(formId: number): Promise<FormResponse[]> {
    return await prisma.formResponse.findMany({
      where: { formId },
      include: {
        form: true,
        participants: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  // Get form response by ID
  static async getFormResponseById(id: number): Promise<FormResponse | null> {
    return await prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
        participants: true,
      },
    });
  }

  // Get form statistics
  static async getFormStats(formId: number) {
    const totalResponses = await prisma.formResponse.count({
      where: { formId },
    });

    const participantsCreated = await prisma.participant.count({
      where: {
        formResponse: {
          formId,
        },
      },
    });

    const contestsUsing = await prisma.contest.count({
      where: { entryFormId: formId },
    });

    return {
      totalResponses,
      participantsCreated,
      contestsUsing,
    };
  }
}
