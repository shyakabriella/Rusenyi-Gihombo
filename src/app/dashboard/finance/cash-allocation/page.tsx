import {
  redirect,
} from "next/navigation";

export default function CashAllocationLegacyRoute() {
  redirect(
    "/dashboard/finance/cash-allocations"
  );
}
