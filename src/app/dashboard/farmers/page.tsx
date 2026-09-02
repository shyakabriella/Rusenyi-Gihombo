import { redirect } from "next/navigation";

export default function FarmersRedirectPage() {
  redirect("/dashboard/people/farmers");
}
