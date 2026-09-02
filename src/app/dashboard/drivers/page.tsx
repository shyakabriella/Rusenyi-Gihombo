import {
  redirect,
} from "next/navigation";

export default function DriversRedirectPage() {
  redirect(
    "/dashboard/people/drivers",
  );
}
