import { createClient } from '@/lib/supabase/server'
import { StaffActionButtons } from '@/components/admin/StaffActions'
import { StaffSearch } from '@/components/admin/StaffSearch'
import { Suspense } from 'react'
import { Shield, User as UserIcon } from 'lucide-react'

export default async function StaffManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const supabase = await createClient()
  const { query } = await searchParams

  // 1. Fetch profiles with optional filtering
  let dbQuery = supabase.from('profiles').select('*').order('email')

  if (query) {
    dbQuery = dbQuery.ilike('email', `%${query}%`)
  }

  const { data: staff } = await dbQuery
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Mutare Team</h1>
          <p className="text-gray-500 text-sm">Manage staff roles and dashboard access</p>
        </div>

        <Suspense fallback={<div className="h-10 w-full md:w-64 bg-gray-100 animate-pulse rounded-md" />}>
          <div className="w-full md:w-auto">
            <StaffSearch />
          </div>
        </Suspense>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Member</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Access Level</th>
              <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff?.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                  No staff members found matching "{query}"
                </td>
              </tr>
            ) : (
              staff?.map((member) => {
                const isMe = member.email === user?.email;
                return (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{member.email}</span>
                        {isMe && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full w-fit font-bold mt-1 uppercase">Owner</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {member.role || 'User'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">{!isMe && <StaffActionButtons memberId={member.id} />}</div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden space-y-4">
        {staff?.length === 0 ? (
          <div className="p-8 text-center text-gray-400 italic bg-white rounded-xl border border-gray-100">
            No staff members found matching "{query}"
          </div>
        ) : (
          staff?.map((member) => {
            const isMe = member.email === user?.email;
            return (
              <div key={member.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">

                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm break-all">{member.email}</p>
                      {isMe && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase inline-block mt-1">Owner</span>}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-50 w-full" />

                {/* Card Body */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {member.role || 'User'}
                    </span>
                  </div>

                  {/* Actions (Only show if not me) */}
                  {!isMe && (
                    <div>
                      <StaffActionButtons memberId={member.id} />
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}