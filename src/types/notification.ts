export type NotificationType =
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "approval_cancelled"
  | string;

export type NotificationCreator = {
  id: number;
  name: string;
};

export type SystemNotification = {
  id: number;
  notification_code: string;

  type: NotificationType;

  title: string;
  message: string;

  module?: string | null;

  reference_type?: string | null;
  reference_id?: number | null;
  reference_code?: string | null;

  action_url?: string | null;

  data?: Record<string, unknown> | null;

  is_read: boolean;

  read_at?: string | null;
  created_at?: string | null;

  creator?: NotificationCreator | null;
};

export type NotificationSummary = {
  total: number;
  unread: number;
  read: number;
  today: number;
  approval_notifications: number;
};

export type NotificationList = {
  items: SystemNotification[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
