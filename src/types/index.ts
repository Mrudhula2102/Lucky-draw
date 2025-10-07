// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Contest Types
export interface Contest {
  id: string;
  name: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  prizes: Prize[];
  entryRules: string;
  participationMethod: ParticipationMethod[];
  totalParticipants: number;
  totalEntries: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  qrCodeUrl?: string; // URL for QR code participation
}

export enum ContestStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ParticipationMethod {
  // Removed QR, WHATSAPP, MANUAL
}

export interface Prize {
  id: string;
  name: string;
  value: number;
  quantity: number;
  imageUrl?: string;
}

// Participant Types
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contestId: string;
  entryDate: string;
  entryMethod: ParticipationMethod;
  ipAddress?: string;
  deviceId?: string;
  isDuplicate: boolean;
  isValid: boolean;
  metadata?: Record<string, any>;
}

// Winner Types
export interface Winner {
  id: string;
  participantId: string;
  participant: Participant;
  contestId: string;
  contest: Contest;
  prize: Prize;
  wonAt: string;
  prizeStatus: PrizeStatus;
  notificationSent: boolean;
  claimedAt?: string;
  dispatchedAt?: string;
  notes?: string;
}

export enum PrizeStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  CLAIMED = 'CLAIMED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
}

// Draw Types
export interface Draw {
  id: string;
  contestId: string;
  executedBy: string;
  executedAt: string;
  drawType: DrawType;
  winnersCount: number;
  winners: Winner[];
  isLive: boolean;
}

export enum DrawType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
}

// Communication Types
export interface Message {
  id: string;
  type: MessageType;
  recipients: string[];
  subject?: string;
  content: string;
  sentAt: string;
  sentBy: string;
  status: MessageStatus;
}

export enum MessageType {
  WELCOME = 'WELCOME',
  REMINDER = 'REMINDER',
  RESULT = 'RESULT',
  CUSTOM = 'CUSTOM',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// Analytics Types
export interface Analytics {
  totalContests: number;
  activeContests: number;
  totalParticipants: number;
  totalWinners: number;
  participationTrend: TrendData[];
  contestPerformance: ContestPerformance[];
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ContestPerformance {
  contestId: string;
  contestName: string;
  participants: number;
  entries: number;
  engagementRate: number;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
