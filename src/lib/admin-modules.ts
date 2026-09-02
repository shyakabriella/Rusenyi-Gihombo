import {
  Banknote,
  Boxes,
  CarFront,
  CircleDollarSign,
  ClipboardCheck,
  Coffee,
  Factory,
  HandCoins,
  MapPinned,
  PackageCheck,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  UserCog,
  Users,
  UsersRound,
  Warehouse,
  Wheat,
  Wrench,
  ArrowLeftRight,
  Cog,
  BarChart3,
} from "lucide-react";

export const coffeeOperationLinks = [
  {
    title: "Coffee Purchases",
    description:
      "View all coffee purchases, quantities, price per kg, total amount and payment status.",
    href: "/dashboard/coffee-operations/coffee-purchases",
    icon: ShoppingBasket,
  },
  {
    title: "Direct Farmer Deliveries",
    description:
      "Monitor farmers delivering coffee directly to Gihombo.",
    href: "/dashboard/coffee-operations/direct-farmer-deliveries",
    icon: Wheat,
  },
  {
    title: "Agent Collections",
    description:
      "Track coffee collected by agents from their collection areas.",
    href: "/dashboard/coffee-operations/agent-collections",
    icon: UsersRound,
  },
  {
    title: "Field Weighing",
    description:
      "Monitor field weight recorded by Balance Officers and compare it with Agent Collection quantity.",
    href: "/dashboard/coffee-operations/field-weighings",
    icon: Scale,
  },
  {
    title: "Factory Receipts",
    description:
      "Track coffee arriving at Gihombo and compare field and factory weights.",
    href: "/dashboard/coffee-operations/factory-receptions",
    icon: Factory,
  },
  {
    title: "Coffee Lots",
    description:
      "Track coffee batches, source, weight, processing stage and storage.",
    href: "/dashboard/coffee-operations/coffee-lots",
    icon: PackageCheck,
  },
  {
    title: "Store / Inventory",
    description:
      "Receive Coffee Lots into storage and monitor stock quantity, bags and storage locations.",
    href: "/dashboard/coffee-operations/store-inventories",
    icon: PackageCheck,
  },
  {
    title: "Stock Movements",
    description:
      "Track inventory increases, decreases, adjustments, transfers and stock reversals.",
    href: "/dashboard/coffee-operations/stock-movements",
    icon: ArrowLeftRight,
  },
  {
    title: "Coffee Processing",
    description:
      "Manage processing batches and trace coffee issued from Store Inventory into processing.",
    href: "/dashboard/coffee-operations/processing-batches",
    icon: Cog,
  },

  {
    title: "Processing Yield & Loss",
    description:
      "Monitor processing input, output, yield percentage, loss and generated output Coffee Lots.",
    href: "/dashboard/coffee-operations/processing-yields",
    icon: BarChart3,
  },
];

export const peopleLinks = [
  {
    title: "Agents",
    description:
      "Manage agent profiles, cash, collections, deliveries and performance.",
    href: "/dashboard/people/agents",
    icon: UsersRound,
  },
  {
    title: "Drivers & Vehicles",
    description:
      "Manage driver profiles, vehicle availability, capacity and driver assignments.",
    href: "/dashboard/people/transport",
    icon: Truck,
  },
  {
    title: "Farmers",
    description:
      "Manage farmer profiles, locations, coffee deliveries and payments.",
    href: "/dashboard/people/farmers",
    icon: Users,
  },
  {
    title: "Drivers",
    description:
      "Manage drivers, vehicles, trips and transported coffee.",
    href: "/dashboard/people/drivers",
    icon: Truck,
  },
  {
    title: "Workers",
    description:
      "Manage employees, attendance, work history and payroll.",
    href: "/dashboard/people/workers",
    icon: UserCog,
  },
];

export const financeLinks = [
  {
    title: "Cash Management",
    description:
      "Monitor company cash and where money is currently located.",
    href: "/dashboard/finance/cash-management",
    icon: CircleDollarSign,
  },
  {
    title: "Cash Allocation",
    description:
      "Track money allocated to the Accountant.",
    href: "/dashboard/finance/cash-allocations",
    icon: Banknote,
  },
  {
    title: "Agent Funds",
    description:
      "Track money given to agents, used cash and outstanding balances.",
    href: "/dashboard/finance/agent-funds",
    icon: HandCoins,
  },
  {
    title: "Farmer Payments",
    description:
      "Track farmer payments and payment status.",
    href: "/dashboard/finance/farmer-payments",
    icon: ReceiptText,
  },
  {
    title: "Petty Cash",
    description:
      "Manage petty cash requests, approvals and returned balances.",
    href: "/dashboard/finance/petty-cash",
    icon: ClipboardCheck,
  },

  {
    title: "Payroll",
    description:
      "Prepare monthly salaries, process Payroll and record employee salary payments.",
    href: "/dashboard/finance/payroll",
    icon: UsersRound,
  },

  {
    title: "Approvals",
    description:
      "Review financial requests, approve or reject actions and track authorization history.",
    href: "/dashboard/finance/approvals",
    icon: ShieldCheck,
  },
  {
    title: "Expenses",
    description:
      "Track fuel, repairs, utilities, labour and other expenses.",
    href: "/dashboard/finance/expenses",
    icon: ReceiptText,
  },
];

export const logisticsLinks = [
  {
    title: "Collection Trips",
    description:
      "Track drivers, vehicles, agents, collection areas and trip status.",
    href: "/dashboard/logistics/collection-trips",
    icon: Truck,
  },
  {
    title: "Vehicles",
    description:
      "Manage vehicles, drivers, fuel and maintenance.",
    href: "/dashboard/logistics/vehicles",
    icon: CarFront,
  },
  {
    title: "Weight Reconciliation",
    description:
      "Compare field and factory weights and investigate differences.",
    href: "/dashboard/logistics/weight-reconciliation",
    icon: Scale,
  },
];

export const inventoryLinks = [
  {
    title: "Store Dashboard",
    description:
      "Monitor total coffee currently available in store.",
    href: "/dashboard/inventory",
    icon: Warehouse,
  },
  {
    title: "Stock Movements",
    description:
      "Track received, transferred, processed and returned coffee.",
    href: "/dashboard/inventory/stock-movements",
    icon: Boxes,
  },
  {
    title: "Stock Adjustments",
    description:
      "Manage controlled stock corrections and approvals.",
    href: "/dashboard/inventory/stock-adjustments",
    icon: Wrench,
  },
];

export const processingLinks = [
  {
    title: "Processing Overview",
    description:
      "Monitor coffee currently moving through processing.",
    href: "/dashboard/processing",
    icon: Coffee,
  },
  {
    title: "Processing Batches",
    description:
      "Track sorting, pulping, washing, drying, loss and yield.",
    href: "/dashboard/processing/batches",
    icon: Boxes,
  },
];

export const usersPermissionLinks = [
  {
    title: "Users",
    description:
      "Create, update, activate and suspend system users.",
    href: "/dashboard/users-permissions/users",
    icon: UserCog,
  },
  {
    title: "Roles & Permissions",
    description:
      "Manage access permissions for each system role.",
    href: "/dashboard/users-permissions/roles",
    icon: ShieldCheck,
  },
];

export const settingsLinks = [
  {
    title: "Locations",
    description:
      "Manage province, district, sector, cell, village and collection areas.",
    href: "/dashboard/settings/locations",
    icon: MapPinned,
  },
  {
    title: "Coffee Price",
    description:
      "Manage buying price per kilogram and historical prices.",
    href: "/dashboard/settings/coffee-price",
    icon: CircleDollarSign,
  },
  {
    title: "System Settings",
    description:
      "Manage company, season, currency, weight tolerance and approval limits.",
    href: "/dashboard/settings/system",
    icon: Settings,
  },
];
