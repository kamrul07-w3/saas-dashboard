import type { Role, CustomerStatus } from "@/lib/constants";

// API Response envelope
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// User types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  teamId: string | null;
}

// Team types
export interface TeamWithMembers {
  id: string;
  name: string;
  slug: string;
  members: TeamMemberInfo[];
  invitations: InvitationInfo[];
  createdAt: string;
}

export interface TeamMemberInfo {
  id: string;
  userId: string;
  role: Role;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  joinedAt: string;
}

export interface InvitationInfo {
  id: string;
  email: string;
  role: Role;
  status: string;
  expiresAt: string;
  createdAt: string;
}

// Customer types
export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: CustomerStatus;
  plan: string | null;
  mrr: number;
  joinedAt: string;
  lastActiveAt: string | null;
  teamId: string;
}

// Admin user types
export interface AdminUserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isActive: boolean;
  role: Role;
  memberId: string;
  createdAt: string;
  joinedAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalMrr: number;
  mrrGrowth: number;
  churnRate: number;
  newCustomersThisMonth: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Notification types
export interface NotificationInfo {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Activity types
export interface ActivityInfo {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  userId: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: string;
}

// Analytics types
export interface RevenueData {
  snapshots: Array<{
    date: string;
    mrr: number;
    arr: number;
    newMrr: number;
    churnedMrr: number;
    netNewMrr: number;
  }>;
}

export interface UserActivityData {
  snapshots: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
    newSignups: number;
    churnedUsers: number;
  }>;
}

export interface FeatureUsageData {
  snapshots: Array<{
    date: string;
    featureName: string;
    usageCount: number;
    uniqueUsers: number;
  }>;
}

// API Key types
export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revoked: boolean;
}

// Notification Preference types
export interface NotificationPreferenceInfo {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

// Form types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerFormValues {
  name: string;
  email: string;
  company?: string;
  status: CustomerStatus;
  plan?: string;
  mrr: number;
}
