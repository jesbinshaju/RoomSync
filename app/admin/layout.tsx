import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/allocation", label: "Allocation", icon: "🎯" },
  { href: "/admin/rooms", label: "Rooms", icon: "🏠" },
  { href: "/admin/students", label: "Students", icon: "👥" },
  { href: "/admin/fees", label: "Fees", icon: "💳" },
  { href: "/admin/room-changes", label: "Changes", icon: "🔄" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold">RS</div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RoomSync Admin</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:text-primary flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <Link
              href="/api/auth/signout"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:border-red-500/50 transition-all"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
