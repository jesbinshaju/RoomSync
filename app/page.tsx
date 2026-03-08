import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
          RoomSync
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Smart hostel room allocation based on compatibility. Register, complete your profile, and get matched with roommates who share your lifestyle.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Student Registration
          </Link>
          <Link
            href="/api/auth/signin"
            className="px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-muted transition"
          >
            Sign In
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-6 py-3 rounded-lg border border-border bg-background font-medium hover:bg-muted transition"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
