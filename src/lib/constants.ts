export const APP_NAME = "SaaS Dashboard";

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 60,
} as const;

export const API_VERSION = "v1";

export const DATE_FORMAT = "MMM dd, yyyy";
export const DATETIME_FORMAT = "MMM dd, yyyy HH:mm";

export const CUSTOMER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  CHURNED: "CHURNED",
} as const;

export type CustomerStatus =
  (typeof CUSTOMER_STATUS)[keyof typeof CUSTOMER_STATUS];

export const NOTIFICATION_TYPES = {
  INFO: "INFO",
  WARNING: "WARNING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
} as const;

export const ACTIVITY_TYPES = {
  USER_LOGIN: "USER_LOGIN",
  USER_SIGNUP: "USER_SIGNUP",
  CUSTOMER_CREATED: "CUSTOMER_CREATED",
  CUSTOMER_UPDATED: "CUSTOMER_UPDATED",
  CUSTOMER_DELETED: "CUSTOMER_DELETED",
  TEAM_MEMBER_ADDED: "TEAM_MEMBER_ADDED",
  TEAM_MEMBER_REMOVED: "TEAM_MEMBER_REMOVED",
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  API_KEY_CREATED: "API_KEY_CREATED",
  API_KEY_REVOKED: "API_KEY_REVOKED",
} as const;
