"use client"

import { updateStaffRole, removeStaff } from '@/actions/staff-actions'
import { UserMinus, ShieldCheck, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function StaffActionButtons({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleAction = async (action: 'staff' | 'admin' | 'revoke') => {
    startTransition(async () => {
      let result;
      
      if (action === 'revoke') {
        result = await removeStaff(memberId)
      } else {
        result = await updateStaffRole(memberId, action)
      }

      if (result.success) {
        toast.success(`Successfully updated ${action === 'revoke' ? 'access' : 'role'}`)
      } else {
        toast.error(result.message || "Something went wrong")
      }
    })
  }

  return (
    <div className={`flex justify-end gap-3 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        onClick={() => handleAction('staff')}
        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
      >
        <UserCog className="h-3.5 w-3.5" /> Staff
      </button>

      <button 
        onClick={() => handleAction('admin')}
        className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
      >
        <ShieldCheck className="h-3.5 w-3.5" /> Admin
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button 
        onClick={() => handleAction('revoke')}
        className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
      >
        <UserMinus className="h-3.5 w-3.5" /> Revoke
      </button>
    </div>
  )
}