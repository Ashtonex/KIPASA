import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { MobileSidebar } from "@/components/admin/MobileSidebar"

export const metadata = {
  title: "Admin Dashboard | Kipasa Store",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Check Auth Session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 2. Check Admin Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:block w-72 bg-slate-900 text-white shrink-0 overflow-y-auto border-r border-slate-800">
        <AdminSidebar />
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* ================= MOBILE HEADER ================= */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Hamburger menu */}
            <MobileSidebar />
            <span className="font-black text-lg text-slate-900 tracking-tight">
              KIPASA STORE
            </span>
          </div>

          <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">
            K
          </div>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  )
}
