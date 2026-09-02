"use client";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  EllipsisVertical,
  Eye,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  createUser,
  getUser,
  getUsers,
  resendUserCredentials,
  resetUserCredentials,
  updateUser,
  updateUserStatus,
} from "@/services/user-service";

import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserCollectionResponse,
  UserRole,
  UserStatus,
} from "@/types/user";

const roles: Array<{
  value: UserRole;
  label: string;
}> = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "accountant",
    label: "Accountant",
  },
  {
    value: "balance",
    label: "Balance Officer",
  },
  {
    value: "agent",
    label: "Agent",
  },
  {
    value: "driver",
    label: "Driver",
  },
  {
    value: "store",
    label: "Store Officer",
  },
  {
    value: "worker",
    label: "Worker",
  },
];

const emptyCreateForm: CreateUserPayload = {
  name: "",
  email: "",
  phone: "",
  role: "agent",
};

type ConfirmationAction =
  | "suspend"
  | "activate"
  | "reset"
  | "resend";

type ConfirmState = {
  user: User;
  action: ConfirmationAction;
} | null;

function roleLabel(
  role?: UserRole | null,
) {
  return (
    roles.find(
      (item) =>
        item.value === role,
    )?.label ??
    "Unknown Role"
  );
}

function userStatus(
  user: User,
): UserStatus {
  if (
    user.status === "active" ||
    user.status === "inactive" ||
    user.status === "suspended"
  ) {
    return user.status;
  }

  return user.is_active
    ? "active"
    : "inactive";
}

function formatDate(
  date?: string | null,
) {
  if (!date) {
    return "Never";
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return "—";
  }

  return parsed.toLocaleString();
}

function initials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase(),
    )
    .join("");
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

function Modal({
  title,
  description,
  children,
  onClose,
  footer,
  maxWidth = "max-w-lg",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
      />

      <div
        className={[
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-[#e8dfd2] bg-white shadow-[0_25px_70px_rgba(15,23,42,0.25)]",
          maxWidth,
        ].join(" ")}
      >
        <div className="flex items-start justify-between border-b border-[#eee7de] px-5 py-4">
          <div className="pr-5">
            <h2 className="text-base font-bold text-slate-950">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-[#eee7de] bg-[#fcfaf7] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersManagement() {
  const {
    user: currentUser,
  } = useCurrentUser();

  const [data, setData] =
    useState<UserCollectionResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    createForm,
    setCreateForm,
  ] = useState<CreateUserPayload>(
    emptyCreateForm,
  );

  const [
    createLoading,
    setCreateLoading,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | null>(
    null,
  );

  const [
    viewLoading,
    setViewLoading,
  ] = useState(false);

  const [
    viewOpen,
    setViewOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    editLoading,
    setEditLoading,
  ] = useState(false);

  const [
    editForm,
    setEditForm,
  ] = useState<UpdateUserPayload>(
    {},
  );

  const [
    confirm,
    setConfirm,
  ] = useState<ConfirmState>(
    null,
  );

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    menu,
    setMenu,
  ] = useState<{
    user: User;
    top: number;
    left: number;
  } | null>(null);

  const loadUsers =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await getUsers({
            search,
            role,
            status,
            page,
            per_page: 10,
          });

        setData(result);
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to load users.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [
      search,
      role,
      status,
      page,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        loadUsers,
        300,
      );

    return () =>
      window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    function closeMenu() {
      setMenu(null);
    }

    function escape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setMenu(null);
      }
    }

    window.addEventListener(
      "resize",
      closeMenu,
    );

    window.addEventListener(
      "scroll",
      closeMenu,
      true,
    );

    document.addEventListener(
      "keydown",
      escape,
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeMenu,
      );

      window.removeEventListener(
        "scroll",
        closeMenu,
        true,
      );

      document.removeEventListener(
        "keydown",
        escape,
      );
    };
  }, []);

  function notifySuccess(
    message: string,
  ) {
    setError("");
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 4000);
  }

  async function submitCreate(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (createLoading) {
      return;
    }

    setError("");

    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.phone.trim()
    ) {
      setError(
        "Name, email and phone are required.",
      );

      return;
    }

    setCreateLoading(true);

    try {
      const response =
        await createUser({
          name:
            createForm.name.trim(),
          email:
            createForm.email
              .trim()
              .toLowerCase(),
          phone:
            createForm.phone.trim(),
          role: createForm.role,
        });

      setCreateOpen(false);

      setCreateForm({
        ...emptyCreateForm,
      });

      notifySuccess(
        response.credentials_email_sent
          ? "User created and login credentials were sent by email."
          : "User created, but the credentials email could not be sent.",
      );

      setPage(1);
      await loadUsers();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to create user.",
        ),
      );
    } finally {
      setCreateLoading(false);
    }
  }

  async function openView(
    user: User,
  ) {
    setMenu(null);
    setViewLoading(true);
    setViewOpen(true);
    setSelectedUser(user);
    setError("");

    try {
      const freshUser =
        await getUser(user.id);

      setSelectedUser(
        freshUser,
      );
    } catch (error) {
      setViewOpen(false);

      setError(
        getErrorMessage(
          error,
          "Unable to load user details.",
        ),
      );
    } finally {
      setViewLoading(false);
    }
  }

  function openEdit(
    user: User,
  ) {
    setMenu(null);
    setSelectedUser(user);

    setEditForm({
      name: user.name,
      email: user.email,
      phone:
        user.phone ?? "",
      role:
        user.role ?? "agent",
    });

    setEditOpen(true);
    setError("");
  }

  async function submitEdit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !selectedUser ||
      editLoading
    ) {
      return;
    }

    if (
      !editForm.name?.trim() ||
      !editForm.email?.trim() ||
      !editForm.phone?.trim() ||
      !editForm.role
    ) {
      setError(
        "Name, email, phone and role are required.",
      );

      return;
    }

    setEditLoading(true);
    setError("");

    try {
      await updateUser(
        selectedUser.id,
        {
          name:
            editForm.name.trim(),
          email:
            editForm.email
              .trim()
              .toLowerCase(),
          phone:
            editForm.phone.trim(),
          role: editForm.role,
        },
      );

      setEditOpen(false);
      setSelectedUser(null);

      notifySuccess(
        "User updated successfully.",
      );

      await loadUsers();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to update user.",
        ),
      );
    } finally {
      setEditLoading(false);
    }
  }

  async function executeAction() {
    if (
      !confirm ||
      actionLoading
    ) {
      return;
    }

    const {
      user,
      action,
    } = confirm;

    setActionLoading(true);
    setError("");

    try {
      if (
        action === "suspend"
      ) {
        await updateUserStatus(
          user.id,
          "suspended",
        );

        notifySuccess(
          `${user.name} has been suspended.`,
        );
      }

      if (
        action === "activate"
      ) {
        await updateUserStatus(
          user.id,
          "active",
        );

        notifySuccess(
          `${user.name} has been activated.`,
        );
      }

      if (
        action === "reset"
      ) {
        await resetUserCredentials(
          user.id,
        );

        notifySuccess(
          `New credentials were generated and sent to ${user.email}.`,
        );
      }

      if (
        action === "resend"
      ) {
        await resendUserCredentials(
          user.id,
        );

        notifySuccess(
          `New credentials were generated and sent to ${user.email}.`,
        );
      }

      setConfirm(null);

      await loadUsers();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Unable to complete this action.",
        ),
      );

      setConfirm(null);
    } finally {
      setActionLoading(false);
    }
  }

  function confirmationText() {
    if (!confirm) {
      return {
        title: "",
        description: "",
        button: "",
      };
    }

    const name =
      confirm.user.name;

    switch (
      confirm.action
    ) {
      case "suspend":
        return {
          title:
            "Suspend User",
          description:
            `Suspend ${name}? The user will no longer be able to sign in and existing sessions will be revoked.`,
          button:
            "Suspend User",
        };

      case "activate":
        return {
          title:
            "Activate User",
          description:
            `Activate ${name}? The user will be allowed to sign in again.`,
          button:
            "Activate User",
        };

      case "reset":
        return {
          title:
            "Reset Credentials",
          description:
            `Generate a new temporary password for ${name}? Existing sessions will be revoked and new credentials will be emailed.`,
          button:
            "Reset Credentials",
        };

      case "resend":
        return {
          title:
            "Resend Credentials",
          description:
            `A new temporary password will be generated for ${name} and emailed. The previous password will stop working.`,
          button:
            "Resend Credentials",
        };
    }
  }

  const confirmation =
    confirmationText();

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            System Users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage staff accounts,
            roles, credentials and
            account status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setCreateOpen(true);
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0a5038] px-4 text-sm font-semibold text-white transition hover:bg-[#073e2c]"
        >
          <UserPlus size={17} />

          Add User
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span className="flex-1">
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span className="flex-1">
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-[#e8e1d7] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search name, email or phone..."
              className="h-10 w-full rounded-lg border border-[#e5ded4] bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-[#d4b071] focus:ring-2 focus:ring-[#d4b071]/10"
            />
          </div>

          <select
            value={role}
            onChange={(event) => {
              setRole(
                event.target.value,
              );
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[#e5ded4] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#d4b071]"
          >
            <option value="">
              All roles
            </option>

            {roles.map(
              (item) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {item.label}
                </option>
              ),
            )}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value,
              );
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[#e5ded4] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#d4b071]"
          >
            <option value="">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="suspended">
              Suspended
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8e1d7] bg-white">
        {loading ? (
          <div className="flex min-h-[340px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={25}
                className="mx-auto animate-spin text-[#0a5038]"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading users...
              </p>
            </div>
          </div>
        ) : !data?.users.length ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <Users
              size={35}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No users found
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-[#faf5ed] text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">
                      User
                    </th>

                    <th className="px-4 py-3">
                      Phone
                    </th>

                    <th className="px-4 py-3">
                      Role
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Last Login
                    </th>

                    <th className="w-[80px] px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.users.map(
                    (user) => {
                      const currentStatus =
                        userStatus(
                          user,
                        );

                      return (
                        <tr
                          key={user.id}
                          className="border-t border-slate-100 transition hover:bg-[#fdfbf8]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4e7d2] text-[11px] font-bold text-[#0a5038]">
                                {initials(
                                  user.name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">
                                  {
                                    user.name
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {
                                    user.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {user.phone ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[#f5ead8] px-2.5 py-1 text-xs font-medium text-[#694616]">
                              {roleLabel(
                                user.role,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                                currentStatus ===
                                "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : currentStatus ===
                                      "suspended"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                currentStatus
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500">
                            {formatDate(
                              user.last_login_at,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              aria-label={`Actions for ${user.name}`}
                              onClick={(
                                event,
                              ) => {
                                const rect =
                                  event.currentTarget.getBoundingClientRect();

                                setMenu({
                                  user,
                                  top:
                                    rect.bottom +
                                    6,
                                  left:
                                    Math.max(
                                      12,
                                      rect.right -
                                        220,
                                    ),
                                });
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-[#e7ddd0] hover:bg-[#faf5ed] hover:text-slate-900"
                            >
                              <EllipsisVertical
                                size={
                                  19
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {data.pagination
                  .from ?? 0}{" "}
                -{" "}
                {data.pagination
                  .to ?? 0}{" "}
                of{" "}
                {
                  data.pagination
                    .total
                }{" "}
                users
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    data.pagination
                      .current_page <=
                    1
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        Math.max(
                          1,
                          value - 1,
                        ),
                    )
                  }
                  className="rounded-lg border border-[#e5ded4] px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#faf5ed] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    data.pagination
                      .current_page >=
                    data.pagination
                      .last_page
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        value + 1,
                    )
                  }
                  className="rounded-lg border border-[#e5ded4] px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#faf5ed] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed 3-dot menu */}
      {menu && (
        <>
          <button
            type="button"
            aria-label="Close actions"
            onClick={() =>
              setMenu(null)
            }
            className="fixed inset-0 z-[70]"
          />

          <div
            className="fixed z-[80] w-[220px] overflow-hidden rounded-xl border border-[#e7ddd0] bg-white p-1.5 shadow-[0_15px_40px_rgba(15,23,42,0.18)]"
            style={{
              top: menu.top,
              left: menu.left,
            }}
          >
            <button
              type="button"
              onClick={() =>
                openView(
                  menu.user,
                )
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-[#faf5ed]"
            >
              <Eye size={16} />

              View Details
            </button>

            <button
              type="button"
              onClick={() =>
                openEdit(
                  menu.user,
                )
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-[#faf5ed]"
            >
              <Edit3 size={16} />

              Edit User
            </button>

            <div className="my-1 h-px bg-slate-100" />

            <button
              type="button"
              disabled={
                userStatus(
                  menu.user,
                ) !== "active"
              }
              onClick={() => {
                setConfirm({
                  user: menu.user,
                  action:
                    "reset",
                });

                setMenu(null);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-[#faf5ed] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <KeyRound
                size={16}
              />

              Reset Credentials
            </button>

            <button
              type="button"
              disabled={
                userStatus(
                  menu.user,
                ) !== "active"
              }
              onClick={() => {
                setConfirm({
                  user: menu.user,
                  action:
                    "resend",
                });

                setMenu(null);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-[#faf5ed] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />

              Resend Credentials
            </button>

            <div className="my-1 h-px bg-slate-100" />

            {userStatus(
              menu.user,
            ) === "active" ? (
              <button
                type="button"
                disabled={
                  currentUser?.id ===
                  menu.user.id
                }
                onClick={() => {
                  setConfirm({
                    user:
                      menu.user,
                    action:
                      "suspend",
                  });

                  setMenu(null);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <UserX
                  size={16}
                />

                {currentUser?.id ===
                menu.user.id
                  ? "Cannot Suspend Yourself"
                  : "Suspend User"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConfirm({
                    user:
                      menu.user,
                    action:
                      "activate",
                  });

                  setMenu(null);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                <UserCheck
                  size={16}
                />

                Activate User
              </button>
            )}
          </div>
        </>
      )}

      {/* Create modal */}
      {createOpen && (
        <Modal
          title="Add New User"
          description="The system will generate a temporary password and email the login credentials."
          onClose={() => {
            if (
              !createLoading
            ) {
              setCreateOpen(
                false,
              );
            }
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={
                  createLoading
                }
                onClick={() =>
                  setCreateOpen(
                    false,
                  )
                }
                className="h-10 rounded-lg border border-[#ddd4c8] px-4 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="create-user-form"
                disabled={
                  createLoading
                }
                className="flex h-10 items-center gap-2 rounded-lg bg-[#0a5038] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {createLoading && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                Create User
              </button>
            </div>
          }
        >
          <form
            id="create-user-form"
            onSubmit={
              submitCreate
            }
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Full Name
              </label>

              <input
                value={
                  createForm.name
                }
                onChange={(event) =>
                  setCreateForm(
                    (current) => ({
                      ...current,
                      name:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={
                  createForm.email
                }
                onChange={(event) =>
                  setCreateForm(
                    (current) => ({
                      ...current,
                      email:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Phone
              </label>

              <input
                value={
                  createForm.phone
                }
                onChange={(event) =>
                  setCreateForm(
                    (current) => ({
                      ...current,
                      phone:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                User Role
              </label>

              <select
                value={
                  createForm.role
                }
                onChange={(event) =>
                  setCreateForm(
                    (current) => ({
                      ...current,
                      role:
                        event
                          .target
                          .value as UserRole,
                    }),
                  )
                }
                className="h-11 w-full rounded-lg border border-[#ddd4c8] bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
              >
                {roles.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
              <Mail
                size={17}
                className="mt-0.5 shrink-0"
              />

              No password is entered here.
              A secure temporary password
              is generated automatically.
            </div>
          </form>
        </Modal>
      )}

      {/* View modal */}
      {viewOpen && (
        <Modal
          title="User Details"
          description="Account information and authentication status."
          onClose={() => {
            setViewOpen(false);
            setSelectedUser(
              null,
            );
          }}
          maxWidth="max-w-xl"
        >
          {viewLoading ||
          !selectedUser ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <LoaderCircle
                size={25}
                className="animate-spin text-[#0a5038]"
              />
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4e7d2] text-base font-bold text-[#0a5038]">
                  {initials(
                    selectedUser.name,
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">
                    {
                      selectedUser.name
                    }
                  </h3>

                  <p className="text-sm text-slate-500">
                    {
                      selectedUser.email
                    }
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Phone",
                    selectedUser.phone ??
                      "—",
                  ],
                  [
                    "Role",
                    roleLabel(
                      selectedUser.role,
                    ),
                  ],
                  [
                    "Status",
                    userStatus(
                      selectedUser,
                    ),
                  ],
                  [
                    "Must Change Password",
                    selectedUser.must_change_password
                      ? "Yes"
                      : "No",
                  ],
                  [
                    "Last Login",
                    formatDate(
                      selectedUser.last_login_at,
                    ),
                  ],
                  [
                    "Created",
                    formatDate(
                      selectedUser.created_at,
                    ),
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      key={
                        label
                      }
                      className="rounded-xl border border-[#eee7de] bg-[#fcfaf7] p-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                        {value}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {editOpen &&
        selectedUser && (
          <Modal
            title="Edit User"
            description={`Update ${selectedUser.name}'s account information.`}
            onClose={() => {
              if (
                !editLoading
              ) {
                setEditOpen(
                  false,
                );
              }
            }}
            footer={
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={
                    editLoading
                  }
                  onClick={() =>
                    setEditOpen(
                      false,
                    )
                  }
                  className="h-10 rounded-lg border border-[#ddd4c8] px-4 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="edit-user-form"
                  disabled={
                    editLoading
                  }
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#0a5038] px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {editLoading && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  Save Changes
                </button>
              </div>
            }
          >
            <form
              id="edit-user-form"
              onSubmit={
                submitEdit
              }
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  value={
                    editForm.name ??
                    ""
                  }
                  onChange={(event) =>
                    setEditForm(
                      (current) => ({
                        ...current,
                        name:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={
                    editForm.email ??
                    ""
                  }
                  onChange={(event) =>
                    setEditForm(
                      (current) => ({
                        ...current,
                        email:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Phone
                </label>

                <input
                  value={
                    editForm.phone ??
                    ""
                  }
                  onChange={(event) =>
                    setEditForm(
                      (current) => ({
                        ...current,
                        phone:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#ddd4c8] px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Role
                </label>

                <select
                  value={
                    editForm.role ??
                    "agent"
                  }
                  disabled={
                    currentUser?.id ===
                      selectedUser.id &&
                    selectedUser.role ===
                      "admin"
                  }
                  onChange={(event) =>
                    setEditForm(
                      (current) => ({
                        ...current,
                        role:
                          event
                            .target
                            .value as UserRole,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#ddd4c8] bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0a5038] disabled:bg-slate-100"
                >
                  {roles.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    ),
                  )}
                </select>

                {currentUser?.id ===
                  selectedUser.id &&
                  selectedUser.role ===
                    "admin" && (
                    <p className="mt-2 text-xs text-amber-700">
                      You cannot remove
                      your own Admin role.
                    </p>
                  )}
              </div>
            </form>
          </Modal>
        )}

      {/* Confirmation modal */}
      {confirm && (
        <Modal
          title={
            confirmation.title
          }
          description={
            confirmation.description
          }
          onClose={() => {
            if (
              !actionLoading
            ) {
              setConfirm(null);
            }
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  setConfirm(null)
                }
                className="h-10 rounded-lg border border-[#ddd4c8] px-4 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={
                  executeAction
                }
                className={[
                  "flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60",
                  confirm.action ===
                  "suspend"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#0a5038] hover:bg-[#073e2c]",
                ].join(" ")}
              >
                {actionLoading && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {
                  confirmation.button
                }
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-4 rounded-xl bg-[#faf7f2] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShieldAlert
                size={20}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {
                  confirm.user.name
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {
                  confirm.user.email
                }
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
