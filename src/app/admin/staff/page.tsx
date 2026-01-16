import { createClient } from '@/lib/supabase/server'
import { StaffActionButtons } from '@/components/admin/StaffActions'
import { StaffSearch } from '@/components/admin/StaffSearch'
import { Suspense } from 'react'

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mutare Team</h1>
          <p className="text-gray-500 text-sm">Manage staff roles and dashboard access</p>
        </div>
        
        {/* ADD SEARCH BAR HERE */}
        <Suspense fallback={<div className="h-10 w-64 bg-gray-100 animate-pulse rounded-md" />}>
          <StaffSearch />
        </Suspense>
      </div>

      <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          {/* ... existing thead ... */}
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
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
    </div>
  )
}