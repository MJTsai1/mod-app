import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staffAuth";

export default async function AdminIndexPage() {
  const session = await getStaffSession();
  redirect(session ? "/admin/dashboard" : "/admin/login");
}
