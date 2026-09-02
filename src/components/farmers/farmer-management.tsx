"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Eye,
  FileDown,
  Filter,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  UserRoundCheck,
  Users,
  X,
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
  createFarmer,
  deactivateFarmer,
  getFarmer,
  getFarmers,
  reactivateFarmer,
  updateFarmer,
} from "@/services/farmer-service";

import {
  getCellOptions,
  getCollectionPointOptions,
  getDistrictOptions,
  getProvinceOptions,
  getSectorOptions,
  getVillageOptions,
} from "@/services/farmer-location-service";

import type {
  Farmer,
  FarmerGender,
  FarmerPayload,
  FarmerPaymentMethod,
  FarmerStatus,
  LocationOption,
} from "@/types/farmer";

type FarmerForm = {
  full_name: string;
  phone: string;
  national_id: string;
  gender: "" | FarmerGender;

  province_id: string;
  district_id: string;
  sector_id: string;
  cell_id: string;
  village_id: string;

  collection_point_id: string;

  preferred_payment_method:
    FarmerPaymentMethod;

  address_note: string;
  notes: string;
};

type ConfirmationState = {
  action:
    | "deactivate"
    | "reactivate";

  farmer: Farmer;
} | null;

const emptyForm: FarmerForm = {
  full_name: "",
  phone: "",
  national_id: "",
  gender: "",

  province_id: "",
  district_id: "",
  sector_id: "",
  cell_id: "",
  village_id: "",

  collection_point_id: "",

  preferred_payment_method:
    "cash",

  address_note: "",
  notes: "",
};

export default function FarmerManagement() {
  const [farmers, setFarmers] =
    useState<Farmer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [activeTotal, setActiveTotal] =
    useState(0);

  const [
    inactiveTotal,
    setInactiveTotal,
  ] = useState(0);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [
    provinceFilter,
    setProvinceFilter,
  ] = useState("");

  const [
    districtFilter,
    setDistrictFilter,
  ] = useState("");

  const [
    sectorFilter,
    setSectorFilter,
  ] = useState("");

  const [
    cellFilter,
    setCellFilter,
  ] = useState("");

  const [
    villageFilter,
    setVillageFilter,
  ] = useState("");

  const [
    collectionPointFilter,
    setCollectionPointFilter,
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState("");

  const [
    appliedProvince,
    setAppliedProvince,
  ] = useState("");

  const [
    appliedDistrict,
    setAppliedDistrict,
  ] = useState("");

  const [
    appliedSector,
    setAppliedSector,
  ] = useState("");

  const [
    appliedCell,
    setAppliedCell,
  ] = useState("");

  const [
    appliedVillage,
    setAppliedVillage,
  ] = useState("");

  const [
    appliedCollectionPoint,
    setAppliedCollectionPoint,
  ] = useState("");

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
    filterCollectionPoints,
    setFilterCollectionPoints,
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
    formCollectionPoints,
    setFormCollectionPoints,
  ] =
    useState<LocationOption[]>([]);

  const [
    formModalOpen,
    setFormModalOpen,
  ] = useState(false);

  const [
    viewModalOpen,
    setViewModalOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<Farmer | null>(
      null,
    );

  const [
    viewing,
    setViewing,
  ] =
    useState<Farmer | null>(
      null,
    );

  const [form, setForm] =
    useState<FarmerForm>({
      ...emptyForm,
    });

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationState>(
      null,
    );

  const loadFarmers =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            response,
            activeResponse,
            inactiveResponse,
          ] = await Promise.all([
            getFarmers({
              search:
                appliedSearch ||
                undefined,

              status:
                appliedStatus
                  ? (appliedStatus as FarmerStatus)
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

              collection_point_id:
                appliedCollectionPoint
                  ? Number(
                      appliedCollectionPoint,
                    )
                  : undefined,

              page,
              per_page: 10,
            }),

            getFarmers({
              status: "active",
              per_page: 1,
            }),

            getFarmers({
              status: "inactive",
              per_page: 1,
            }),
          ]);

          setFarmers(
            response.items,
          );

          setTotal(
            response
              .pagination.total,
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
              .pagination.total,
          );

          setInactiveTotal(
            inactiveResponse
              .pagination.total,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load farmers.",
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
        appliedCollectionPoint,
        page,
      ],
    );

  useEffect(() => {
    void loadFarmers();
  }, [loadFarmers]);

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

  const assignedCollectionPoints =
    useMemo(
      () =>
        farmers.filter(
          (farmer) =>
            farmer.collection_point,
        ).length,
      [farmers],
    );

  async function changeFilterProvince(
    value: string,
  ) {
    setProvinceFilter(value);

    setDistrictFilter("");
    setSectorFilter("");
    setCellFilter("");
    setVillageFilter("");
    setCollectionPointFilter("");

    setFilterDistricts([]);
    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);
    setFilterCollectionPoints([]);

    if (!value) {
      return;
    }

    setFilterDistricts(
      await getDistrictOptions(
        Number(value),
      ),
    );
  }

  async function changeFilterDistrict(
    value: string,
  ) {
    setDistrictFilter(value);

    setSectorFilter("");
    setCellFilter("");
    setVillageFilter("");
    setCollectionPointFilter("");

    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);
    setFilterCollectionPoints([]);

    if (!value) {
      return;
    }

    setFilterSectors(
      await getSectorOptions(
        Number(value),
      ),
    );
  }

  async function changeFilterSector(
    value: string,
  ) {
    setSectorFilter(value);

    setCellFilter("");
    setVillageFilter("");
    setCollectionPointFilter("");

    setFilterCells([]);
    setFilterVillages([]);
    setFilterCollectionPoints([]);

    if (!value) {
      return;
    }

    setFilterCells(
      await getCellOptions(
        Number(value),
      ),
    );
  }

  async function changeFilterCell(
    value: string,
  ) {
    setCellFilter(value);

    setVillageFilter("");
    setCollectionPointFilter("");

    setFilterVillages([]);
    setFilterCollectionPoints([]);

    if (!value) {
      return;
    }

    setFilterVillages(
      await getVillageOptions(
        Number(value),
      ),
    );
  }

  async function changeFilterVillage(
    value: string,
  ) {
    setVillageFilter(value);

    setCollectionPointFilter("");
    setFilterCollectionPoints([]);

    if (!value) {
      return;
    }

    setFilterCollectionPoints(
      await getCollectionPointOptions(
        Number(value),
      ),
    );
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

    setAppliedCollectionPoint(
      collectionPointFilter,
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
    setCollectionPointFilter("");

    setFilterDistricts([]);
    setFilterSectors([]);
    setFilterCells([]);
    setFilterVillages([]);
    setFilterCollectionPoints([]);

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedProvince("");
    setAppliedDistrict("");
    setAppliedSector("");
    setAppliedCell("");
    setAppliedVillage("");
    setAppliedCollectionPoint("");

    setPage(1);
  }

  function resetFormLocations() {
    setFormDistricts([]);
    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);
    setFormCollectionPoints([]);
  }

  function openCreate() {
    setError("");
    setSuccess("");

    setEditing(null);

    resetFormLocations();

    setForm({
      ...emptyForm,
    });

    setFormModalOpen(true);
  }

  async function openEdit(
    farmer: Farmer,
  ) {
    setError("");
    setSuccess("");

    setEditing(farmer);
    resetFormLocations();

    const location =
      farmer.location;

    if (!location) {
      setForm({
        ...emptyForm,

        full_name:
          farmer.full_name,

        phone:
          farmer.phone,

        national_id:
          farmer.national_id ??
          "",

        gender:
          farmer.gender ??
          "",

        village_id:
          String(
            farmer.village_id,
          ),

        collection_point_id:
          farmer.collection_point_id
            ? String(
                farmer.collection_point_id,
              )
            : "",

        preferred_payment_method:
          farmer.preferred_payment_method,

        address_note:
          farmer.address_note ??
          "",

        notes:
          farmer.notes ??
          "",
      });

      setFormModalOpen(true);
      return;
    }

    try {
      const districts =
        await getDistrictOptions(
          location.province.id,
        );

      const sectors =
        await getSectorOptions(
          location.district.id,
        );

      const cells =
        await getCellOptions(
          location.sector.id,
        );

      const villages =
        await getVillageOptions(
          location.cell.id,
        );

      const collectionPoints =
        await getCollectionPointOptions(
          location.village.id,
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

      setFormCollectionPoints(
        collectionPoints,
      );

      setForm({
        full_name:
          farmer.full_name,

        phone:
          farmer.phone,

        national_id:
          farmer.national_id ??
          "",

        gender:
          farmer.gender ??
          "",

        province_id:
          String(
            location.province.id,
          ),

        district_id:
          String(
            location.district.id,
          ),

        sector_id:
          String(
            location.sector.id,
          ),

        cell_id:
          String(
            location.cell.id,
          ),

        village_id:
          String(
            location.village.id,
          ),

        collection_point_id:
          farmer.collection_point_id
            ? String(
                farmer.collection_point_id,
              )
            : "",

        preferred_payment_method:
          farmer.preferred_payment_method,

        address_note:
          farmer.address_note ??
          "",

        notes:
          farmer.notes ??
          "",
      });

      setFormModalOpen(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load farmer location.",
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
        collection_point_id: "",
      }),
    );

    setFormDistricts([]);
    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);
    setFormCollectionPoints([]);

    if (value) {
      setFormDistricts(
        await getDistrictOptions(
          Number(value),
        ),
      );
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
        collection_point_id: "",
      }),
    );

    setFormSectors([]);
    setFormCells([]);
    setFormVillages([]);
    setFormCollectionPoints([]);

    if (value) {
      setFormSectors(
        await getSectorOptions(
          Number(value),
        ),
      );
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
        collection_point_id: "",
      }),
    );

    setFormCells([]);
    setFormVillages([]);
    setFormCollectionPoints([]);

    if (value) {
      setFormCells(
        await getCellOptions(
          Number(value),
        ),
      );
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
        collection_point_id: "",
      }),
    );

    setFormVillages([]);
    setFormCollectionPoints([]);

    if (value) {
      setFormVillages(
        await getVillageOptions(
          Number(value),
        ),
      );
    }
  }

  async function changeFormVillage(
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        village_id:
          value,

        collection_point_id:
          "",
      }),
    );

    setFormCollectionPoints([]);

    if (value) {
      setFormCollectionPoints(
        await getCollectionPointOptions(
          Number(value),
        ),
      );
    }
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.full_name.trim()
    ) {
      setError(
        "Farmer name is required.",
      );

      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Farmer phone number is required.",
      );

      return;
    }

    if (!form.village_id) {
      setError(
        "Farmer village is required.",
      );

      return;
    }

    const payload: FarmerPayload =
      {
        full_name:
          form.full_name.trim(),

        phone:
          form.phone.trim(),

        national_id:
          form.national_id.trim() ||
          null,

        gender:
          form.gender ||
          null,

        village_id:
          Number(
            form.village_id,
          ),

        collection_point_id:
          form.collection_point_id
            ? Number(
                form.collection_point_id,
              )
            : null,

        preferred_payment_method:
          form.preferred_payment_method,

        address_note:
          form.address_note.trim() ||
          null,

        notes:
          form.notes.trim() ||
          null,
      };

    setSaving(true);

    try {
      if (editing) {
        await updateFarmer(
          editing.id,
          payload,
        );

        setSuccess(
          "Farmer updated successfully.",
        );
      } else {
        await createFarmer(
          payload,
        );

        setSuccess(
          "Farmer registered successfully.",
        );
      }

      setFormModalOpen(false);
      setEditing(null);

      await loadFarmers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save farmer.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(
    farmer: Farmer,
  ) {
    setViewModalOpen(true);

    setViewing(farmer);

    setDetailsLoading(true);

    try {
      setViewing(
        await getFarmer(
          farmer.id,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load farmer details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        confirmation.action ===
        "deactivate"
      ) {
        await deactivateFarmer(
          confirmation
            .farmer.id,
        );

        setSuccess(
          "Farmer deactivated successfully.",
        );
      } else {
        await reactivateFarmer(
          confirmation
            .farmer.id,
        );

        setSuccess(
          "Farmer reactivated successfully.",
        );
      }

      setConfirmation(null);

      await loadFarmers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change farmer status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function exportCsv() {
    if (!farmers.length) {
      return;
    }

    const rows = [
      [
        "Farmer Code",
        "Full Name",
        "Phone",
        "National ID",
        "Province",
        "District",
        "Sector",
        "Cell",
        "Village",
        "Collection Point",
        "Payment Method",
        "Status",
      ],

      ...farmers.map(
        (farmer) => [
          farmer.farmer_code,

          farmer.full_name,

          farmer.phone,

          farmer.national_id ??
            "",

          farmer.location
            ?.province
            ?.name ??
            "",

          farmer.location
            ?.district
            ?.name ??
            "",

          farmer.location
            ?.sector
            ?.name ??
            "",

          farmer.location
            ?.cell
            ?.name ??
            "",

          farmer.location
            ?.village
            ?.name ??
            "",

          farmer.collection_point
            ?.name ??
            "",

          farmer.preferred_payment_method,

          farmer.status,
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
      "farmers.csv";

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
      {/* TITLE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Farmers Management
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Register and manage farmer profiles, locations and collection points.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#064b30]"
        >
          <Plus size={17} />
          Add Farmer
        </button>
      </div>

      {/* MAIN FILTERS */}
      <section className="rounded-xl border border-[#e5ded4] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Search Farmer">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Code, name, phone or National ID..."
                className={inputClass(
                  true,
                )}
              />
            </div>
          </FilterField>

          <FilterField label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              className={selectClass}
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
              onChange={(event) =>
                void changeFilterProvince(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Provinces
              </option>

              {provinces.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
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
              onChange={(event) =>
                void changeFilterDistrict(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Districts
              </option>

              {filterDistricts.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Sector">
            <select
              value={sectorFilter}
              disabled={
                !districtFilter
              }
              onChange={(event) =>
                void changeFilterSector(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Sectors
              </option>

              {filterSectors.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Cell">
            <select
              value={cellFilter}
              disabled={
                !sectorFilter
              }
              onChange={(event) =>
                void changeFilterCell(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Cells
              </option>

              {filterCells.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Village">
            <select
              value={villageFilter}
              disabled={
                !cellFilter
              }
              onChange={(event) =>
                void changeFilterVillage(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Villages
              </option>

              {filterVillages.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Collection Point">
            <select
              value={
                collectionPointFilter
              }
              disabled={
                !villageFilter
              }
              onChange={(event) =>
                setCollectionPointFilter(
                  event.target.value,
                )
              }
              className={selectClass}
            >
              <option value="">
                All Collection Points
              </option>

              {filterCollectionPoints.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </FilterField>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#eee7dd] pt-4">
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064b30]"
          >
            <Filter size={16} />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8c8b2] bg-[#fffdf9] px-4 text-sm font-bold text-[#075b38] hover:bg-[#f8f0e4]"
          >
            <FileDown size={16} />
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

      {/* METRICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Farmers"
          value={total}
          note="Matching current filters"
        />

        <MetricCard
          icon={UserRoundCheck}
          label="Active Farmers"
          value={activeTotal}
          note="Available for operations"
        />

        <MetricCard
          icon={CircleOff}
          label="Inactive Farmers"
          value={inactiveTotal}
          note="Not available for purchases"
        />

        <MetricCard
          icon={MapPin}
          label="Collection Assigned"
          value={assignedCollectionPoints}
          note="On current page"
        />
      </section>

      {/* TABLE */}
      <section className="overflow-hidden rounded-xl border border-[#e5ded4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b border-[#e9e2d9] text-left text-xs font-bold text-slate-800">
                <th className="w-14 px-4 py-4">
                  #
                </th>

                <th className="px-4 py-4">
                  Farmer
                </th>

                <th className="px-4 py-4">
                  Phone
                </th>

                <th className="px-4 py-4">
                  Location
                </th>

                <th className="px-4 py-4">
                  Collection Point
                </th>

                <th className="px-4 py-4">
                  Payment
                </th>

                <th className="px-4 py-4">
                  Status
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
                    colSpan={8}
                    className="py-20 text-center"
                  >
                    <LoaderCircle
                      size={29}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : farmers.length ? (
                farmers.map(
                  (
                    farmer,
                    index,
                  ) => (
                    <tr
                      key={farmer.id}
                      className="border-b border-slate-100 text-sm transition hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-600">
                        {(page - 1) *
                          10 +
                          index +
                          1}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {farmer.full_name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#8a631d]">
                          {farmer.farmer_code}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {farmer.phone}
                        </p>

                        {farmer.national_id && (
                          <p className="mt-1 text-xs text-slate-500">
                            ID:{" "}
                            {farmer.national_id}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {farmer.location
                            ?.village
                            ?.name ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            farmer.location
                              ?.sector
                              ?.name,

                            farmer.location
                              ?.district
                              ?.name,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {farmer.collection_point ? (
                          <>
                            <p className="font-semibold text-slate-800">
                              {
                                farmer
                                  .collection_point
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                farmer
                                  .collection_point
                                  .code
                              }
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <PaymentBadge
                          method={
                            farmer.preferred_payment_method
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            farmer.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            title="View Farmer"
                            onClick={() =>
                              void openView(
                                farmer,
                              )
                            }
                          >
                            <Eye size={16} />
                          </ActionButton>

                          <ActionButton
                            title="Edit Farmer"
                            onClick={() =>
                              void openEdit(
                                farmer,
                              )
                            }
                          >
                            <Pencil size={16} />
                          </ActionButton>

                          {farmer.status ===
                          "active" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmation(
                                  {
                                    action:
                                      "deactivate",

                                    farmer,
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

                                    farmer,
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
                    colSpan={8}
                    className="py-16 text-center"
                  >
                    <Users
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-900">
                      No farmers found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Register a farmer or change the filters.
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
              {lastPage}
            </span>
            {" · "}
            {total} farmer records
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
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#f7e7cd] px-3 text-sm font-bold text-[#80570f]">
              {page}
            </span>

            <button
              type="button"
              disabled={
                page >= lastPage ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT */}
      {formModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editing
                    ? "Edit Farmer"
                    : "Register Farmer"}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Farmer Code is generated automatically by the system.
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
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-6 p-6"
            >
              <FormSection title="Farmer Information">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Full Name"
                    required
                  >
                    <input
                      required
                      value={
                        form.full_name
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            full_name:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Farmer full name"
                      className={inputClass()}
                    />
                  </FormField>

                  <FormField
                    label="Phone Number"
                    required
                  >
                    <input
                      required
                      value={
                        form.phone
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            phone:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="0788123456"
                      className={inputClass()}
                    />
                  </FormField>

                  <FormField label="National ID">
                    <input
                      value={
                        form.national_id
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            national_id:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Optional National ID"
                      className={inputClass()}
                    />
                  </FormField>

                  <FormField label="Gender">
                    <select
                      value={
                        form.gender
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            gender:
                              event
                                .target
                                .value as
                                | ""
                                | FarmerGender,
                          }),
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Not specified
                      </option>

                      <option value="male">
                        Male
                      </option>

                      <option value="female">
                        Female
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Farmer Location">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    label="Province"
                    required
                  >
                    <select
                      required
                      value={
                        form.province_id
                      }
                      onChange={(event) =>
                        void changeFormProvince(
                          event.target.value,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select Province
                      </option>

                      {provinces.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="District"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.province_id
                      }
                      value={
                        form.district_id
                      }
                      onChange={(event) =>
                        void changeFormDistrict(
                          event.target.value,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select District
                      </option>

                      {formDistricts.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Sector"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.district_id
                      }
                      value={
                        form.sector_id
                      }
                      onChange={(event) =>
                        void changeFormSector(
                          event.target.value,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select Sector
                      </option>

                      {formSectors.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Cell"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.sector_id
                      }
                      value={
                        form.cell_id
                      }
                      onChange={(event) =>
                        void changeFormCell(
                          event.target.value,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select Cell
                      </option>

                      {formCells.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Village"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.cell_id
                      }
                      value={
                        form.village_id
                      }
                      onChange={(event) =>
                        void changeFormVillage(
                          event.target.value,
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select Village
                      </option>

                      {formVillages.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Collection Point">
                    <select
                      disabled={
                        !form.village_id
                      }
                      value={
                        form.collection_point_id
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            collection_point_id:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        No Collection Point
                      </option>

                      {formCollectionPoints.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                            {item.code
                              ? ` (${item.code})`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Payment & Notes">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Preferred Payment Method"
                    required
                  >
                    <select
                      required
                      value={
                        form.preferred_payment_method
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            preferred_payment_method:
                              event
                                .target
                                .value as FarmerPaymentMethod,
                          }),
                        )
                      }
                      className={selectClass}
                    >
                      <option value="cash">
                        Cash
                      </option>

                      <option value="mobile_money">
                        Mobile Money
                      </option>

                      <option value="bank">
                        Bank
                      </option>
                    </select>
                  </FormField>

                  <div className="rounded-lg border border-[#eadfce] bg-[#faf6ef] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Farmer Code
                    </p>

                    <p className="mt-2 font-bold text-slate-950">
                      {editing
                        ? editing.farmer_code
                        : "Generated automatically"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FormField label="Address Note">
                    <textarea
                      rows={3}
                      value={
                        form.address_note
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            address_note:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Optional address or landmark..."
                      className={textareaClass}
                    />
                  </FormField>

                  <FormField label="Notes">
                    <textarea
                      rows={3}
                      value={
                        form.notes
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,

                            notes:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Optional farmer notes..."
                      className={textareaClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  disabled={saving}
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
                  disabled={saving}
                  className="inline-flex h-10 min-w-[140px] items-center justify-center rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
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
                    "Register Farmer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Farmer Details
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Farmer profile and location information.
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
                <X size={19} />
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
                      {viewing.full_name}
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#8a631d]">
                      {viewing.farmer_code}
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      viewing.status
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail
                    label="Phone"
                    value={
                      viewing.phone
                    }
                  />

                  <Detail
                    label="National ID"
                    value={
                      viewing.national_id ??
                      "—"
                    }
                  />

                  <Detail
                    label="Gender"
                    value={
                      viewing.gender
                        ? capitalize(
                            viewing.gender,
                          )
                        : "—"
                    }
                  />

                  <Detail
                    label="Province"
                    value={
                      viewing.location
                        ?.province
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="District"
                    value={
                      viewing.location
                        ?.district
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Sector"
                    value={
                      viewing.location
                        ?.sector
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Cell"
                    value={
                      viewing.location
                        ?.cell
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Village"
                    value={
                      viewing.location
                        ?.village
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Collection Point"
                    value={
                      viewing.collection_point
                        ?.name ??
                      "Not assigned"
                    }
                  />

                  <Detail
                    label="Payment Method"
                    value={paymentLabel(
                      viewing.preferred_payment_method,
                    )}
                  />

                  <Detail
                    label="Created By"
                    value={
                      viewing.creator
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Created At"
                    value={formatDateTime(
                      viewing.created_at,
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <NoteBox
                    label="Address Note"
                    value={
                      viewing.address_note
                    }
                  />

                  <NoteBox
                    label="Notes"
                    value={
                      viewing.notes
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CONFIRM STATUS */}
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
                <CircleOff size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              {confirmation.action ===
              "deactivate"
                ? "Deactivate Farmer?"
                : "Reactivate Farmer?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmation.farmer.full_name}
              {" · "}
              {confirmation.farmer.farmer_code}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {confirmation.action ===
              "deactivate"
                ? "Inactive farmers will not appear in operational farmer lookup."
                : "This farmer will become available for coffee operations again."}
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
  icon: typeof Users;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          <Icon size={22} />
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

function StatusBadge({
  status,
}: {
  status: FarmerStatus;
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

function PaymentBadge({
  method,
}: {
  method:
    FarmerPaymentMethod;
}) {
  return (
    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
      {paymentLabel(
        method,
      )}
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

function Detail({
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

      <p className="mt-1 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function NoteBox({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 min-h-[80px] rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700">
        {value ||
          "No information provided."}
      </div>
    </div>
  );
}

function paymentLabel(
  value:
    FarmerPaymentMethod,
) {
  if (
    value ===
    "mobile_money"
  ) {
    return "Mobile Money";
  }

  if (value === "bank") {
    return "Bank";
  }

  return "Cash";
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
