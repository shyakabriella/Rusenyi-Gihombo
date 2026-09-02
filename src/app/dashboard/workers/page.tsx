import {
  redirect,
} from "next/navigation";

export default function WorkersRedirectPage() {
  redirect(
    "/dashboard/people/workers",
  );
}
