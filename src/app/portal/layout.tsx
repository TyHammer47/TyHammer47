import { requireClient } from "@/lib/session";
import { TopNav } from "@/components/TopNav";

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const user = await requireClient();

  return (
    <div className="flex flex-1 flex-col">
      <TopNav
        name={user.name}
        subtitle="Client Portal"
        links={[
          { href: "/portal", label: "My Tickets" },
          { href: "/portal/projects", label: "Projects" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
