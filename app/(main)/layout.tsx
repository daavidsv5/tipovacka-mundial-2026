import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

async function getPlayers() {
  try {
    return await prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }
  if (!session) redirect("/login");

  const players = await getPlayers();
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-72 fixed top-0 left-0 bottom-0">
        <Sidebar
          players={players}
          isAdmin={isAdmin}
          currentUserId={session.user.id}
          userName={session.user.name ?? ""}
          userEmail={session.user.email ?? ""}
        />
      </aside>

      {/* Mobile header */}
      <MobileHeader
        players={players}
        isAdmin={isAdmin}
        currentUserId={session.user.id}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
      />

      {/* Main content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
