export type PettyCashRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type PettyCashPerson = {
  id: number;
  name: string;
  email?: string | null;
};

export type PettyCashRequest = {
  id: number;
  request_code: string;
  requested_by: number;

  amount: string;
  currency: string;
  purpose: string;

  status:
    PettyCashRequestStatus;

  requester?:
    | PettyCashPerson
    | null;

  approver?:
    | PettyCashPerson
    | null;

  rejecter?:
    | PettyCashPerson
    | null;

  canceller?:
    | PettyCashPerson
    | null;

  approved_at?:
    | string
    | null;

  rejected_at?:
    | string
    | null;

  rejection_reason?:
    | string
    | null;

  cancelled_at?:
    | string
    | null;

  cancellation_reason?:
    | string
    | null;

  created_at: string;
  updated_at: string;
};

export type PettyCashSummary = {
  currency: string;
  balance: string;

  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  approved_amount: string;
  rejected_requests: number;
  cancelled_requests: number;
};

export type PettyCashRequestList = {
  items:
    PettyCashRequest[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
