import { createClient } from '@/lib/supabase/server'
import { updateStaffRole, removeStaff } from '@/actions/staff-actions'
import { UserMinus, ShieldCheck, UserCog } from 'lucide-react'

export default async function StaffManagementPage() {
  const supabase = await createClient()
  
  // 1. Fetch profiles and current user to identify the owner
  const { data: staff } = await supabase.from('profiles').select('*').order('email')
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mutare Team</h1>
          <p className="text-gray-500 text-sm">Manage staff roles and dashboard access</p>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Member</th>
              <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Access Level</th>
              <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Management Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff?.map((member) => {
              const isMe = member.email === user?.email;
              
              return (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{member.email}</span>
                      {isMe && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full w-fit font-bold mt-1 uppercase">
                          Account Owner
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      member.role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {member.role || 'User'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      {/* Only show buttons for other users, not for yourself */}
                      {!isMe && (
                        <>
                          <form action={async () => {
                            'use server'
                            await updateStaffRole(member.id, 'staff')
                          }}>
                            <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                              <UserCog className="h-3.5 w-3.5" /> Staff
                            </button>
                          </form>

                          <form action={async () => {
                            'use server'
                            await updateStaffRole(member.id, 'admin')
                          }}>
                            <button className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                              <ShieldCheck className="h-3.5 w-3.5" /> Admin
                            </button>
                          </form>

                          <div className="w-px h-6 bg-gray-200 mx-1" />

                          <form action={async () => {
                            'use server'
                            await removeStaff(member.id)
                          }}>
                            <button className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                              <UserMinus className="h-3.5 w-3.5" /> Revoke
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}