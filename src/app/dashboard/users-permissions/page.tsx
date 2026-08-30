import ModulePage from "@/components/shared/module-page";
import { usersPermissionLinks } from "@/lib/admin-modules";

export default function UsersPermissionsPage() {
  return (
    <ModulePage
      eyebrow="Administration"
      title="Users & Permissions"
      description="Manage user accounts, roles and system permissions."
      links={usersPermissionLinks}
    />
  );
}
