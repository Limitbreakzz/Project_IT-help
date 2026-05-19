import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavigationShell from "@/components/NavigationShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if ((session.user as any).role === "USER") {
    redirect("/dashboard");
  }

  if ((session.user as any).role === "TECHNICIAN") {
    redirect("/technician");
  }

  return (
    <NavigationShell session={session}>
      {children}
    </NavigationShell>
  );
}
