import { apiRequest } from "@/lib/api";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

export type AttendanceWorker = {
  worker_id: number;
  worker_code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  attendance_id?: number | null;
  status?: AttendanceStatus | null;
  notes?: string | null;
  recorded_by?: number | null;
};

export type AttendanceSummary = {
  workers: number;
  recorded: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
};

export type DailyAttendance = {
  date: string;
  locked: boolean;
  workers: AttendanceWorker[];
  summary: AttendanceSummary;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response:
    | ApiResponse<T>
    | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as ApiResponse<T>
    ).data;
  }

  return response as T;
}

export async function getWorkerAttendance(
  date: string,
): Promise<DailyAttendance> {
  const response =
    await apiRequest<
      ApiResponse<DailyAttendance>
    >(
      `/worker-attendances?date=${encodeURIComponent(
        date,
      )}`,
      {
        method: "GET",
      },
    );

  return unwrap(response);
}
