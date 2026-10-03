import { useState, useEffect } from 'react'
import { FaCheck, FaXmark } from 'react-icons/fa6'
import { playKnockRequestSound } from '../utils/meetingSounds'
import { formatAvatarUrl, getAvatarGradient } from '../utils/meetingCode'

export default function KnockBanner({ requests = [], onAdmit, onReject }) {
  const current = requests && requests.length > 0 ? requests[0] : null
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (current) {
      playKnockRequestSound()
      setImgError(false)
    }
  }, [current?.user_id, current?.avatar])

  if (!current) return null

  const displayName =
    current?.full_name ||
    current?.name ||
    current?.username ||
    current?.email ||
    current?.phone_number ||
    (current?.user_id ? `Foydalanuvchi #${String(current.user_id).slice(0, 8)}` : 'Foydalanuvchi')

  const initials = displayName
    ? displayName.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'U'

  const avatarUrl = formatAvatarUrl(current.avatar)
  const showImg = Boolean(avatarUrl && !imgError)
  const targetId = current.user_id ?? current.id ?? current.guest_id ?? current.username

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-[100] animate-in slide-in-from-top-3 fade-in duration-200">
      <div className="w-72 sm:w-80 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#12161F] border border-slate-200/90 dark:border-white/10 text-slate-800 dark:text-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.8)] select-none transition-all">
        {/* User Info Row */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${getAvatarGradient(
              displayName
            )} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
          >
            {showImg ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
                onError={() => setImgError(true)}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-normal">
              uchrashuvga qo'shilmoqchi
            </p>
          </div>

          {requests.length > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold shrink-0">
              +{requests.length - 1}
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 mt-3.5">
          <button
            type="button"
            onClick={() => onReject(targetId)}
            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1E2430] hover:bg-slate-50 dark:hover:bg-[#283040] text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs"
          >
            <FaXmark size={12} className="text-slate-700 dark:text-slate-200" />
            <span>Rad etish</span>
          </button>

          <button
            type="button"
            onClick={() => onAdmit(targetId)}
            className="flex-1 h-9 px-3 rounded-xl bg-[#3B59BA] hover:bg-[#324D9E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-sm"
          >
            <FaCheck size={11} className="text-white" />
            <span>Ruxsat berish</span>
          </button>
        </div>
      </div>
    </div>
  )
}

