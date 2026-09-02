"use client";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Eye,
  FileDown,
  Filter,
  LoaderCircle,
  MapPinned,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  UserRoundCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAgent,
  deactivateAgent,
  getActiveAgentUsers,
  getAgent,
  getAgents,
  reactivateAgent,
  updateAgent,
} from "@/services/agent-service";

import {
  getCellOptions,
  getDistrictOptions,
  getProvinceOptions,
  getSectorOptions,
  getVillageOptions,
} from "@/services/farmer-location-service";

import type {
  Agent,
  AgentStatus,
  AgentUser,
} from "@/types/agent";

import type {
  LocationOption,
} from "@/types/farmer";

type AgentForm = {
  user_id: string;

  province_id: string;
  district_id: string;
  sector_id: string;
  cell_id: string;
  village_id: string;

  notes: string;
};

type ConfirmationState = {
  action:
    | "deactivate"
    | "reactivate";

  agent: Agent;
} | null;

const emptyForm: AgentForm = {
  user_id: "",

  province_id: "",
  district_id: "",
  sector_id: "",
  cell_id: "",
  village_id: "",

  notes: "",
};

export default function AgentManagement() {
  const [
    agents,
    setAgents,
  ] =
    useState<Agent[]>([]);

  const [
    agentUsers,
    setAgentUsers,
  ] =
    useState<AgentUser[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    detailsLoading,
    setDetailsLoading,
  ] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    lastPage,
    setLastPage,
  ] =
    useState(1);

  const [
    total,
    setTotal,
  ] =
    useState(0);

  const [
    activeTotal,
    setActiveTotal,
  ] =
    useState(0);

  const [
    inactiveTotal,
    setInactiveTotal,
  ] =
    useState(0);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    provinceFilter,
    setProvinceFilter,
  ] =
    useState("");

  const [
    districtFilter,
    setDistrictFilter,
  ] =
    useState("");

  const [
    sectorFilter,
    setSectorFilter,
  ] =
    useState("");

  const [
    cellFilter,
    setCellFilter,
  ] =
    useState("");

  const [
    villageFilter,
    setVillageFilter,
  ] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState("");

  const [
    appliedStatus,
    setAppliedStatus,
  ] =
    useState("");

  const [
    appliedProvince,
    setAppliedProvince,
  ] =
    useState("");

  const [
    appliedDistrict,
    setAppliedDistrict,
  ] =
    useState("");

  const [
    appliedSector,
    setAppliedSector,
  ] =
    useState("");

  const [
    appliedCell,
    setAppliedCell,
  ] =
    useState("");

  const [
    appliedVillage,
    setAppliedVillage,
  ] =
    useState("");

  const [
    provinces,
    setProvinces,
  ] =
    useState<LocationOption[]>([]);

  const [
    filterDistricts,
    setFilterDistricts,
  ] =
    useState<LocationOption[]>([]);

  const [
    filterSectors,
    setFilterSectors,
  ] =
    useState<LocationOption[]>([]);

  const [
    filterCells,
    setFilterCells,
  ] =
    useState<LocationOption[]>([]);

  const [
    filterVillages,
    setFilterVillages,
  ] =
    useState<LocationOption[]>([]);

  const [
    formDistricts,
    setFormDistricts,
  ] =
    useState<LocationOption[]>([]);

  const [
    formSectors,
    setFormSectors,
  ] =
    useState<LocationOption[]>([]);

  const [
    formCells,
    setFormCells,
  ] =
    useState<LocationOption[]>([]);

  const [
    formVillages,
    setFormVillages,
  ] =
    useState<LocationOption[]>([]);

  const [
    formModalOpen,
    setFormModalOpen,
  ] =
    useState(false);

  const [
    viewModalOpen,
    setViewModalOpen,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<Agent | null>(
      null,
    );

  const [
    viewing,
    setViewing,
  ] =
    useState<Agent | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<AgentForm>({
      ...emptyForm,
    });

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationState>(
      null,
    );

  const loadAgents =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            response,
            activeResponse,
            inactiveResponse,
          ] =
            await Promise.all([
              getAgents({
                search:
                  appliedSearch ||
                  undefined,

                status:
                  appliedStatus
                    ? (
                        appliedStatus as AgentStatus
                      )
                    : undefined,

                province_id:
                  appliedProvince
                    ? Number(
                        appliedProvince,
                      )
                    : undefined,

                district_id:
                  appliedDistrict
                    ? Number(
                        appliedDistrict,
                      )
                    : undefined,

                sector_id:
                  appliedSector
                    ? Number(
                        appliedSector,
                      )
                    : undefined,

                cell_id:
                  appliedCell
                    ? Number(
                        appliedCell,
                      )
                    : undefined,

                village_id:
                  appliedVillage
                    ? Number(
                        appliedVillage,
                      )
                    : undefined,

                page,

                per_page: 10,
              }),

              getAgents({
                status:
                  "active",

                per_page: 1,
              }),

              getAgents({
                status:
                  "inactive",

                per_page: 1,
              }),
            ]);

          setAgents(
            response.items,
          );

          setTotal(
            response
              .pagination
              .total,
          );

          setLastPage(
            Math.max(
              1,
              response
                .pagination
                .last_page,
            ),
          );

          setActiveTotal(
            activeResponse
              .pagination
              .total,
          );

          setInactiveTotal(
            inactiveResponse
              .pagination
              .total,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load agents.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        appliedSearch,
        appliedStatus,
        appliedProvince,
        appliedDistrict,
        appliedSector,
        appliedCell,
        appliedVillage,
        page,
      ],
    );

  const loadAgentUsers =
    useCallback(
      async () => {
        try {
          const response =
            await getActiveAgentUsers();

          setAgentUsers(
            response.users,
          );
        } catch {
          setAgentUsers([]);
        }
      },
      [],
    );

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    void loadAgentUsers();
  }, [loadAgentUsers]);

  useEffect(() => {
    async function loadProvinces() {
      try {
        setProvinces(
          await getProvinceOptions(),
        );
      } catch {
        setProvinces([]);
      }
    }

    void loadProvinces();
  }, []);

  const usedUserIds =
    useMemo(
      () =>
        new Set(
          agents.map(
            (agent) =>
              agent.user_id,
          ),
        ),
      [agents],
    );

  const availableUsers =
    useMemo(
      () =>
        agentUsers.filter(
          (user) =>
            !usedUserIds.has(
              user.id,
            ),
        ),
      [
        agentUsers,
        usedUserIds,
      ],
    );

  const withoutHomeVillage =
    useMemo(
      () =>
        agents.filter(
          (agent) =>
            !agent.home_village_id,
        ).length,
      [agents],
    );

  async function changeFilterProvince(
    value: string,
  ) {
    setProvinceFilter(value);

    setDistrictFilter("");
    setSectorFilter("");
    setCellFilter("");
    setVillageFilter("");

    setFilterDistricts([]);
    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);

    if (!value) {
      return;
    }

    try {
      setFilterDistricts(
        await getDistrictOptions(
          Number(value),
        ),
      );
    } catch {
      setFilterDistricts([]);
    }
  }

  async function changeFilterDistrict(
    value: string,
  ) {
    setDistrictFilter(value);

    setSectorFilter("");
    setCellFilter("");
    setVillageFilter("");

    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);

    if (!value) {
      return;
    }

    try {
      setFilterSectors(
        await getSectorOptions(
          Number(value),
        ),
      );
    } catch {
      setFilterSectors([]);
    }
  }

  async function changeFilterSector(
    value: string,
  ) {
    setSectorFilter(value);

    setCellFilter("");
    setVillageFilter("");

    setFilterCells([]);
    setFilterVillages([]);

    if (!value) {
      return;
    }

    try {
      setFilterCells(
        await getCellOptions(
          Number(value),
        ),
      );
    } catch {
      setFilterCells([]);
    }
  }

  async function changeFilterCell(
    value: string,
  ) {
    setCellFilter(value);
    setVillageFilter("");

    setFilterVillages([]);

    if (!value) {
      return;
    }

    try {
      setFilterVillages(
        await getVillageOptions(
          Number(value),
        ),
      );
    } catch {
      setFilterVillages([]);
    }
  }

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );

    setAppliedStatus(
      status,
    );

    setAppliedProvince(
      provinceFilter,
    );

    setAppliedDistrict(
      districtFilter,
    );

    setAppliedSector(
      sectorFilter,
    );

    setAppliedCell(
      cellFilter,
    );

    setAppliedVillage(
      villageFilter,
    );

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");

    setProvinceFilter("");
    setDistrictFilter("");
    setSectorFilter("");
    setCellFilter("");
    setVillageFilter("");

    setFilterDistricts([]);
    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedProvince("");
    setAppliedDistrict("");
    setAppliedSector("");
    setAppliedCell("");
    setAppliedVillage("");

    setPage(1);
  }

  function resetFormLocation() {
    setFormDistricts([]);
    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);
  }

  function openCreate() {
    setError("");
    setSuccess("");

    setEditing(null);

    resetFormLocation();

    setForm({
      ...emptyForm,
    });

    setFormModalOpen(true);
  }

  async function openEdit(
    agent: Agent,
  ) {
    setError("");
    setSuccess("");

    setEditing(agent);

    resetFormLocation();

    const location =
      agent.home_location;

    if (!location) {
      setForm({
        user_id:
          String(
            agent.user_id,
          ),

        province_id: "",
        district_id: "",
        sector_id: "",
        cell_id: "",
        village_id: "",

        notes:
          agent.notes ??
          "",
      });

      setFormModalOpen(
        true,
      );

      return;
    }

    const province =
      location.province;

    const district =
      location.district;

    const sector =
      location.sector;

    const cell =
      location.cell;

    const village =
      location.village;

    /*
     * A home location can be present while one of its
     * hierarchy relations is missing or inactive.
     *
     * In that case we open the edit form without trying
     * to dereference a null location relation.
     */
    if (
      !province ||
      !district ||
      !sector ||
      !cell ||
      !village
    ) {
      setForm({
        user_id:
          String(
            agent.user_id,
          ),

        province_id:
          province
            ? String(
                province.id,
              )
            : "",

        district_id:
          district
            ? String(
                district.id,
              )
            : "",

        sector_id:
          sector
            ? String(
                sector.id,
              )
            : "",

        cell_id:
          cell
            ? String(
                cell.id,
              )
            : "",

        village_id:
          village
            ? String(
                village.id,
              )
            : "",

        notes:
          agent.notes ??
          "",
      });

      setFormModalOpen(
        true,
      );

      return;
    }

    try {
      const districts =
        await getDistrictOptions(
          province.id,
        );

      const sectors =
        await getSectorOptions(
          district.id,
        );

      const cells =
        await getCellOptions(
          sector.id,
        );

      const villages =
        await getVillageOptions(
          cell.id,
        );

      setFormDistricts(
        districts,
      );

      setFormSectors(
        sectors,
      );

      setFormCells(
        cells,
      );

      setFormVillages(
        villages,
      );

      setForm({
        user_id:
          String(
            agent.user_id,
          ),

        province_id:
          String(
            province.id,
          ),

        district_id:
          String(
            district.id,
          ),

        sector_id:
          String(
            sector.id,
          ),

        cell_id:
          String(
            cell.id,
          ),

        village_id:
          String(
            village.id,
          ),

        notes:
          agent.notes ??
          "",
      });

      setFormModalOpen(
        true,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load agent location.",
      );
    }
  }

  async function changeFormProvince(
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        province_id:
          value,

        district_id: "",
        sector_id: "",
        cell_id: "",
        village_id: "",
      }),
    );

    setFormDistricts([]);
    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);

    if (!value) {
      return;
    }

    try {
      setFormDistricts(
        await getDistrictOptions(
          Number(value),
        ),
      );
    } catch {
      setFormDistricts([]);
    }
  }

  async function changeFormDistrict(
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        district_id:
          value,

        sector_id: "",
        cell_id: "",
        village_id: "",
      }),
    );

    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);

    if (!value) {
      return;
    }

    try {
      setFormSectors(
        await getSectorOptions(
          Number(value),
        ),
      );
    } catch {
      setFormSectors([]);
    }
  }

  async function changeFormSector(
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        sector_id:
          value,

        cell_id: "",
        village_id: "",
      }),
    );

    setFormCells([]);
    setFormVillages([]);

    if (!value) {
      return;
    }

    try {
      setFormCells(
        await getCellOptions(
          Number(value),
        ),
      );
    } catch {
      setFormCells([]);
    }
  }

  async function changeFormCell(
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        cell_id:
          value,

        village_id: "",
      }),
    );

    setFormVillages([]);

    if (!value) {
      return;
    }

    try {
      setFormVillages(
        await getVillageOptions(
          Number(value),
        ),
      );
    } catch {
      setFormVillages([]);
    }
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !editing &&
      !form.user_id
    ) {
      setError(
        "Select an Agent user.",
      );

      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateAgent(
          editing.id,
          {
            home_village_id:
              form.village_id
                ? Number(
                    form.village_id,
                  )
                : null,

            notes:
              form.notes.trim() ||
              null,
          },
        );

        setSuccess(
          "Agent profile updated successfully.",
        );
      } else {
        await createAgent({
          user_id:
            Number(
              form.user_id,
            ),

          home_village_id:
            form.village_id
              ? Number(
                  form.village_id,
                )
              : null,

          notes:
            form.notes.trim() ||
            null,
        });

        setSuccess(
          "Agent profile created successfully.",
        );
      }

      setFormModalOpen(
        false,
      );

      setEditing(null);

      await Promise.all([
        loadAgents(),
        loadAgentUsers(),
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save agent.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(
    agent: Agent,
  ) {
    setViewing(agent);

    setViewModalOpen(
      true,
    );

    setDetailsLoading(
      true,
    );

    try {
      setViewing(
        await getAgent(
          agent.id,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load agent details.",
      );
    } finally {
      setDetailsLoading(
        false,
      );
    }
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    setActionLoading(
      true,
    );

    setError("");
    setSuccess("");

    try {
      if (
        confirmation.action ===
        "deactivate"
      ) {
        await deactivateAgent(
          confirmation
            .agent.id,
        );

        setSuccess(
          "Agent deactivated successfully.",
        );
      } else {
        await reactivateAgent(
          confirmation
            .agent.id,
        );

        setSuccess(
          "Agent reactivated successfully.",
        );
      }

      setConfirmation(
        null,
      );

      await loadAgents();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change agent status.",
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  function exportCsv() {
    if (!agents.length) {
      return;
    }

    const rows = [
      [
        "Agent Code",
        "Name",
        "Phone",
        "Email",
        "Province",
        "District",
        "Sector",
        "Cell",
        "Village",
        "Agent Status",
        "User Status",
      ],

      ...agents.map(
        (agent) => [
          agent.agent_code,

          agent.user?.name ??
            "",

          agent.user?.phone ??
            "",

          agent.user?.email ??
            "",

          agent.home_location
            ?.province
            ?.name ??
            "",

          agent.home_location
            ?.district
            ?.name ??
            "",

          agent.home_location
            ?.sector
            ?.name ??
            "",

          agent.home_location
            ?.cell
            ?.name ??
            "",

          agent.home_location
            ?.village
            ?.name ??
            "",

          agent.status,

          agent.user?.status ??
            "",
        ],
      ),
    ];

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value,
                  ).replaceAll(
                    '"',
                    '""',
                  )}"`,
              )
              .join(","),
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      "agents.csv";

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Agents Management
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage field agents, home areas, operational status and collection assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/administration/locations"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d9c9b2] bg-white px-4 text-sm font-bold text-[#075b38] transition hover:bg-[#faf5ed]"
          >
            <MapPinned
              size={17}
            />

            Collection Points
          </Link>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#064b30]"
          >
            <Plus size={17} />

            Add Agent
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#e5ded4] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Search Agent">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Code, name, phone or email..."
                className={inputClass(
                  true,
                )}
              />
            </div>
          </FilterField>

          <FilterField label="Status">
            <select
              value={status}
              onChange={(
                event,
              ) =>
                setStatus(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </FilterField>

          <FilterField label="Province">
            <select
              value={
                provinceFilter
              }
              onChange={(
                event,
              ) =>
                void changeFilterProvince(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Provinces
              </option>

              {provinces.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="District">
            <select
              value={
                districtFilter
              }
              disabled={
                !provinceFilter
              }
              onChange={(
                event,
              ) =>
                void changeFilterDistrict(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Districts
              </option>

              {filterDistricts.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Sector">
            <select
              value={
                sectorFilter
              }
              disabled={
                !districtFilter
              }
              onChange={(
                event,
              ) =>
                void changeFilterSector(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Sectors
              </option>

              {filterSectors.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Cell">
            <select
              value={
                cellFilter
              }
              disabled={
                !sectorFilter
              }
              onChange={(
                event,
              ) =>
                void changeFilterCell(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Cells
              </option>

              {filterCells.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Village">
            <select
              value={
                villageFilter
              }
              disabled={
                !cellFilter
              }
              onChange={(
                event,
              ) =>
                setVillageFilter(
                  event
                    .target
                    .value,
                )
              }
              className={
                selectClass
              }
            >
              <option value="">
                All Villages
              </option>

              {filterVillages.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#eee7dd] pt-4">
          <button
            type="button"
            onClick={
              applyFilters
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064b30]"
          >
            <Filter size={16} />

            Apply Filters
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            <RotateCcw
              size={16}
            />

            Reset
          </button>

          <button
            type="button"
            onClick={
              exportCsv
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8c8b2] bg-[#fffdf9] px-4 text-sm font-bold text-[#075b38] hover:bg-[#f8f0e4]"
          >
            <FileDown
              size={16}
            />

            Export CSV
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Total Agents"
          value={total}
          note="Matching current filters"
        />

        <MetricCard
          icon={UserRoundCheck}
          label="Active Agents"
          value={
            activeTotal
          }
          note="Available for operations"
        />

        <MetricCard
          icon={CircleOff}
          label="Inactive Agents"
          value={
            inactiveTotal
          }
          note="Unavailable for operations"
        />

        <MetricCard
          icon={MapPinned}
          label="No Home Village"
          value={
            withoutHomeVillage
          }
          note="On current page"
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e5ded4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b border-[#e9e2d9] text-left text-xs font-bold text-slate-800">
                <th className="w-14 px-4 py-4">
                  #
                </th>

                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Contact
                </th>

                <th className="px-4 py-4">
                  Home Area
                </th>

                <th className="px-4 py-4">
                  User Account
                </th>

                <th className="px-4 py-4">
                  Agent Status
                </th>

                <th className="px-4 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-20 text-center"
                  >
                    <LoaderCircle
                      size={29}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : agents.length ? (
                agents.map(
                  (
                    agent,
                    index,
                  ) => (
                    <tr
                      key={
                        agent.id
                      }
                      className="border-b border-slate-100 text-sm transition hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-600">
                        {(page -
                          1) *
                          10 +
                          index +
                          1}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {
                            agent
                              .user
                              ?.name
                          }
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#8a631d]">
                          {
                            agent.agent_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {
                            agent
                              .user
                              ?.phone
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            agent
                              .user
                              ?.email
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {agent.home_location ? (
                          <>
                            <p className="font-semibold text-slate-800">
                              {
                                agent
                                  .home_location
                                  .village
                                  ?.name ??
                                "Location incomplete"
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                [
                                  agent
                                    .home_location
                                    .sector
                                    ?.name,

                                  agent
                                    .home_location
                                    .district
                                    ?.name,
                                ]
                                  .filter(
                                    Boolean,
                                  )
                                  .join(
                                    ", ",
                                  ) ||
                                "Location hierarchy incomplete"
                              }
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            Not set
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <UserStatusBadge
                          status={
                            agent
                              .user
                              ?.status ??
                            "unknown"
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <AgentStatusBadge
                          status={
                            agent.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            title="View Agent"
                            onClick={() =>
                              void openView(
                                agent,
                              )
                            }
                          >
                            <Eye
                              size={
                                16
                              }
                            />
                          </ActionButton>

                          <ActionButton
                            title="Edit Agent"
                            onClick={() =>
                              void openEdit(
                                agent,
                              )
                            }
                          >
                            <Pencil
                              size={
                                16
                              }
                            />
                          </ActionButton>

                          <Link
                            href="/dashboard/administration/locations"
                            title="Manage Collection Points"
                            className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-[#075b38] hover:text-[#075b38]"
                          >
                            <MapPinned
                              size={
                                16
                              }
                            />
                          </Link>

                          {agent.status ===
                          "active" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmation(
                                  {
                                    action:
                                      "deactivate",

                                    agent,
                                  },
                                )
                              }
                              className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmation(
                                  {
                                    action:
                                      "reactivate",

                                    agent,
                                  },
                                )
                              }
                              className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center"
                  >
                    <UsersRound
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-900">
                      No agents found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Create an Agent user first, then create the agent profile.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e9e2d9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">
            Page{" "}
            <span className="font-bold text-slate-900">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {
                lastPage
              }
            </span>
            {" · "}
            {total} agent profiles
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.max(
                      1,
                      current -
                        1,
                    ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#f7e7cd] px-3 text-sm font-bold text-[#80570f]">
              {page}
            </span>

            <button
              type="button"
              disabled={
                page >=
                  lastPage ||
                loading
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    current +
                    1,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {formModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editing
                    ? "Edit Agent"
                    : "Create Agent Profile"}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Agent Code is generated automatically by the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormModalOpen(
                    false,
                  )
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <form
              onSubmit={
                submit
              }
              className="space-y-6 p-6"
            >
              <FormSection title="Agent Account">
                {editing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailCard
                      label="Agent User"
                      value={
                        editing
                          .user
                          ?.name ??
                        "—"
                      }
                    />

                    <DetailCard
                      label="Agent Code"
                      value={
                        editing
                          .agent_code
                      }
                    />
                  </div>
                ) : (
                  <>
                    <FormField
                      label="Agent User"
                      required
                    >
                      <select
                        required
                        value={
                          form.user_id
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              user_id:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className={
                          selectClass
                        }
                      >
                        <option value="">
                          Select Agent User
                        </option>

                        {availableUsers.map(
                          (
                            user,
                          ) => (
                            <option
                              key={
                                user.id
                              }
                              value={
                                user.id
                              }
                            >
                              {
                                user.name
                              }
                              {" — "}
                              {
                                user.phone
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </FormField>

                    <div className="rounded-lg border border-[#eadfce] bg-[#faf6ef] p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Agent Code
                      </p>

                      <p className="mt-2 font-bold text-slate-950">
                        Generated automatically
                      </p>
                    </div>

                    {!availableUsers.length && (
                      <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-900">
                          No unused active Agent users are available.
                        </p>

                        <Link
                          href="/dashboard/users"
                          className="mt-2 inline-flex text-sm font-bold text-[#075b38] underline"
                        >
                          Open User Management
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </FormSection>

              <FormSection title="Home Location">
                <p className="-mt-2 mb-4 text-sm text-slate-500">
                  Home location is optional. Collection-point assignments are managed separately.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField label="Province">
                    <select
                      value={
                        form.province_id
                      }
                      onChange={(
                        event,
                      ) =>
                        void changeFormProvince(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        Select Province
                      </option>

                      {provinces.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="District">
                    <select
                      disabled={
                        !form.province_id
                      }
                      value={
                        form.district_id
                      }
                      onChange={(
                        event,
                      ) =>
                        void changeFormDistrict(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        Select District
                      </option>

                      {formDistricts.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Sector">
                    <select
                      disabled={
                        !form.district_id
                      }
                      value={
                        form.sector_id
                      }
                      onChange={(
                        event,
                      ) =>
                        void changeFormSector(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        Select Sector
                      </option>

                      {formSectors.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Cell">
                    <select
                      disabled={
                        !form.sector_id
                      }
                      value={
                        form.cell_id
                      }
                      onChange={(
                        event,
                      ) =>
                        void changeFormCell(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        Select Cell
                      </option>

                      {formCells.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Village">
                    <select
                      disabled={
                        !form.cell_id
                      }
                      value={
                        form.village_id
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            current,
                          ) => ({
                            ...current,

                            village_id:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        No Home Village
                      </option>

                      {formVillages.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Notes">
                <FormField label="Operational Notes">
                  <textarea
                    rows={4}
                    value={
                      form.notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          notes:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Agent area, responsibilities or other notes..."
                    className={
                      textareaClass
                    }
                  />
                </FormField>
              </FormSection>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/dashboard/administration/locations"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d8c8b2] bg-white px-4 text-sm font-bold text-[#075b38]"
                >
                  <MapPinned
                    size={16}
                  />

                  Manage Collection Points
                </Link>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() =>
                      setFormModalOpen(
                        false,
                      )
                    }
                    className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      (!editing &&
                        !form.user_id)
                    }
                    className="inline-flex h-10 min-w-[150px] items-center justify-center rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="mr-2 animate-spin"
                        />

                        Saving...
                      </>
                    ) : editing ? (
                      "Save Changes"
                    ) : (
                      "Create Agent"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Agent Details
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Agent profile and operational area.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewModalOpen(
                    false,
                  )
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-24 text-center">
                <LoaderCircle
                  size={30}
                  className="mx-auto animate-spin text-[#075b38]"
                />
              </div>
            ) : viewing ? (
              <div className="space-y-5 p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-[#eadfce] bg-[#faf6ef] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-950">
                      {
                        viewing
                          .user
                          ?.name
                      }
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#8a631d]">
                      {
                        viewing.agent_code
                      }
                    </p>
                  </div>

                  <AgentStatusBadge
                    status={
                      viewing.status
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailCard
                    label="Phone"
                    value={
                      viewing
                        .user
                        ?.phone ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Email"
                    value={
                      viewing
                        .user
                        ?.email ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="User Status"
                    value={
                      capitalize(
                        viewing
                          .user
                          ?.status ??
                          "unknown",
                      )
                    }
                  />

                  <DetailCard
                    label="Province"
                    value={
                      viewing
                        .home_location
                        ?.province
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="District"
                    value={
                      viewing
                        .home_location
                        ?.district
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Sector"
                    value={
                      viewing
                        .home_location
                        ?.sector
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Cell"
                    value={
                      viewing
                        .home_location
                        ?.cell
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Village"
                    value={
                      viewing
                        .home_location
                        ?.village
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Created By"
                    value={
                      viewing
                        .creator
                        ?.name ??
                      "—"
                    }
                  />

                  <DetailCard
                    label="Created At"
                    value={
                      formatDateTime(
                        viewing
                          .created_at,
                      )
                    }
                  />

                  <DetailCard
                    label="Updated At"
                    value={
                      formatDateTime(
                        viewing
                          .updated_at,
                      )
                    }
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>

                  <div className="mt-2 min-h-[90px] rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                    {viewing.notes ||
                      "No notes provided."}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-5">
                  <Link
                    href="/dashboard/administration/locations"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
                  >
                    <MapPinned
                      size={16}
                    />

                    Manage Collection Points
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {confirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div
              className={[
                "flex h-11 w-11 items-center justify-center rounded-full",

                confirmation.action ===
                "deactivate"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800",
              ].join(" ")}
            >
              {confirmation.action ===
              "deactivate" ? (
                <CircleOff
                  size={20}
                />
              ) : (
                <CheckCircle2
                  size={20}
                />
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              {confirmation.action ===
              "deactivate"
                ? "Deactivate Agent?"
                : "Reactivate Agent?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {
                confirmation
                  .agent
                  .user
                  ?.name
              }
              {" · "}
              {
                confirmation
                  .agent
                  .agent_code
              }
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {confirmation.action ===
              "deactivate"
                ? "This agent will no longer appear in operational agent lookup."
                : "This agent will become available for operational use again."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  setConfirmation(
                    null,
                  )
                }
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  void confirmAction()
                }
                className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {actionLoading
                  ? "Saving..."
                  : confirmation.action ===
                      "deactivate"
                    ? "Deactivate"
                    : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#075b38] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const textareaClass =
  "w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#075b38]";

function inputClass(
  withSearch = false,
) {
  return [
    "h-11 w-full rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#075b38]",

    withSearch
      ? "pl-9 pr-3"
      : "px-3",
  ].join(" ");
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-800">
        {label}
      </label>

      {children}
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          {title}
        </h3>

        <div className="h-px flex-1 bg-[#eadfce]" />
      </div>

      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          <Icon
            size={22}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}

function AgentStatusBadge({
  status,
}: {
  status: AgentStatus;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-md px-2.5 py-1 text-xs font-bold capitalize",

        status === "active"
          ? "bg-emerald-50 text-emerald-800"
          : "bg-amber-50 text-amber-800",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function UserStatusBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status === "active";

  return (
    <span
      className={[
        "inline-flex rounded-md px-2.5 py-1 text-xs font-bold capitalize",

        active
          ? "bg-sky-50 text-sky-800"
          : "bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function ActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-[#075b38] hover:text-[#075b38]"
    >
      {children}
    </button>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function capitalize(
  value: string,
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}
