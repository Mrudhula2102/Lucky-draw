// Export all services for easy importing
export { ContestService } from './contestService';
export { ParticipantService } from './participantService';
export { DrawService } from './drawService';
export { PrizeService } from './prizeService';
export { AdminService } from './adminService';
export { FormService } from './formService';

// Export Prisma client
export { default as prisma } from '../lib/prisma';

// Export Prisma types for use in components
export type {
  Admin,
  AdminActivityLog,
  Contest,
  Draw,
  Form,
  FormResponse,
  Message,
  Participant,
  Prize,
  Winner,
  role_type,
  contest_status,
  draw_mode,
  prize_status,
  message_type,
  Prisma,
} from '@prisma/client';
