import { redirect } from "next/navigation";

/** The read-only owner page grew into /admin. Keep the old address working. */
export default function OwnerRedirect() {
  redirect("/admin");
}
