"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAppRole } from "@/lib/auth/roles";
import { RoleUpdateError, setUserRoleAsAdmin } from "@/lib/auth/profile-server";

function redirectWithError(code: string): never {
  redirect(`/admin?error=${encodeURIComponent(code)}`);
}

export async function updateUserRoleAction(formData: FormData) {
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const nextRoleRaw = String(formData.get("nextRole") ?? "").trim();

  if (!targetUserId || !isAppRole(nextRoleRaw)) {
    redirectWithError("invalid_request");
  }

  try {
    await setUserRoleAsAdmin(targetUserId, nextRoleRaw);
    revalidatePath("/admin");
    redirect("/admin?status=role_updated");
  } catch (error) {
    if (error instanceof RoleUpdateError) {
      redirectWithError(error.code);
    }

    redirectWithError("unknown");
  }
}
