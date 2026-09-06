export type WorkerStatus =
  | "active"
  | "inactive";

export type Worker = {
  id: number;

  worker_code: string;

  user_id?: number | null;

  name: string;

  phone?: string | null;
  email?: string | null;
  national_id?: string | null;

  worker_type: string;

  status: WorkerStatus;

  has_account: boolean;

  notes?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateWorkerPayload = {
  name: string;

  phone?: string | null;
  email?: string | null;
  national_id?: string | null;

  notes?: string | null;
};

export type WorkerCollectionResponse = {
  workers: Worker[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
