import { requireAdmin } from "@/lib/session";
import { TopNav } from "@/components/TopNav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <TopNav
        name={admin.name}
        subtitle="Engineer Console"
        links={[
          { href: "/admin", label: "Companies" },
          { href: "/admin/companies/new", label: "New Company" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
