import {
  redirect,
} from "next/navigation";

export default function CashAllocationRedirectPage() {
  redirect(
    "/dashboard/finance/cash-allocations"
  );
}
