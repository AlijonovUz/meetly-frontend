import { useState, useEffect, useRef } from 'react'
import { FaXmark, FaCheck, FaEllipsisVertical, FaUserXmark } from 'react-icons/fa6'
import {
  UserGroupIcon,
  Search01Icon,
  Mic01Icon,
  MicOff01Icon,
  Video01Icon,
  VideoOffIcon,
  HandIcon,
  UserRemove01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getAvatarGradient, formatAvatarUrl } from '../utils/meetingCode'

function DrawerParticipantAvatar({ avatar, name }) {
  const [imgError, setImgError] = useState(false)
  const formattedAvatar = formatAvatarUrl(avatar)

  useEffect(() => {
    setImgError(false)
  }, [formattedAvatar])

  const initials = name
    ? name.trim().split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div
      className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${getAvatarGradient(
        name || ''
      )} text-white font-bold flex items-center justify-center text-sm shadow-xs`}
    >
      {formattedAvatar && !imgError ? (
        <img
          src={formattedAvatar}
          alt={name || ''}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default function ParticipantsDrawer({
  isOpen,
  onClose,
  participants = [],
  knockRequests = [],
  isHost = false,
  isLocalHost = false,
  onMuteParticipant,
  onMuteAll,
  onAskUnmuteParticipant,
  onTurnOffCamera,
  onAskTurnOnCamera,
  onRemoveParticipant,
  onAdmitUser,
  onRejectUser,
  currentUserId,
  pinnedId,
  onTogglePin,
  requestedParticipantIds = {},
  onToggleSelfMic,
  onToggleSelfCamera,
}) {
  const [search, setSearch] = useState('')
  const [activeMenuIdentity, setActiveMenuIdentity] = useState(null)
  const [removeTargetParticipant, setRemoveTargetParticipant] = useState(null)
  const menuContainerRef = useRef(null)

  // Close 3-dots menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (activeMenuIdentity && menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setActiveMenuIdentity(null)
      }
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [activeMenuIdentity])

  useEffect(() => {
    if (!isOpen) {
      setActiveMenuIdentity(null)
      setRemoveTargetParticipant(null)
    }
  }, [isOpen])

  const filteredParticipants = participants.filter((p) => {
    const name = p.name || p.identity || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const hasUnmutedGuests = participants.some(
    (p) => !p.isLocal && String(p.identity) !== String(currentUserId) && p.isMicEnabled
  )

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-30 sm:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Participants Panel matching Figma design */}
      <div
        className={`fixed sm:relative top-0 right-0 bottom-0 sm:top-auto sm:right-auto sm:bottom-auto h-full rounded-none sm:rounded-3xl bg-white dark:bg-[#0B0D11] shadow-[0_10px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex flex-col shrink-0 z-40 sm:z-auto overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1)] ${
          isOpen
            ? 'w-full sm:w-[340px] md:w-[360px] opacity-100 pointer-events-auto sm:ml-3 md:ml-4 p-4 sm:p-5 translate-x-0 border-l sm:border border-slate-200/90 dark:border-white/10'
            : 'w-0 opacity-0 pointer-events-none sm:ml-0 p-0 translate-x-full sm:translate-x-0 border-0'
        }`}
      >
        <div className="w-full sm:w-[308px] md:w-[320px] h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between shrink-0 pb-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white select-none">
              Ishtirokchilar
            </h3>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <HugeiconsIcon icon={UserGroupIcon} size={20} strokeWidth={2} />
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors sm:hidden"
                title="Yopish"
              >
                <FaXmark size={14} />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-3.5 mb-4 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#F0F3F7] dark:bg-[#181C24] text-xs sm:text-sm text-slate-800 dark:text-white focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <HugeiconsIcon icon={Search01Icon} size={17} strokeWidth={2} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ishtirokchini qidirish"
                className="w-full bg-transparent placeholder:text-slate-400 outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <FaXmark size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Section Header: MAJLISDA */}
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1 mb-3 shrink-0">
            <span>Majlisda</span>
            {isLocalHost && hasUnmutedGuests && onMuteAll && (
              <button
                type="button"
                onClick={onMuteAll}
                title="Barcha ishtirokchilar mikrofonini o'chirish"
                className="text-[10px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
              >
                Hammasini o'chirish
              </button>
            )}
          </div>

          {/* Participants List */}
          <div
            ref={menuContainerRef}
            className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-none"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#94A3B8 transparent' }}
          >
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Ishtirokchi topilmadi
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const isMe = p.isLocal || String(p.identity) === String(currentUserId)
                const displayName = p.name ? `${p.name}${isMe ? ' (siz)' : ''}` : (isMe ? 'Siz' : 'Ishtirokchi')
                const roleText = p.isHost ? 'Tashkilotchi' : 'Ishtirokchi'
                const req = requestedParticipantIds[p.identity]
                const reqTime = typeof req === 'object' ? req.timestamp : req
                const reqType = typeof req === 'object' ? req.type : null

                const isFulfilled = reqType === 'mic'
                  ? Boolean(p.isMicEnabled)
                  : reqType === 'camera'
                  ? Boolean(p.isCameraEnabled)
                  : Boolean(p.isMicEnabled || p.isCameraEnabled)

                const hasPendingRequest = Boolean(
                  req && !isFulfilled && reqTime && (Date.now() - reqTime < 45000)
                )

                const isMenuOpen = activeMenuIdentity === p.identity

                return (
                  <div
                    key={p.identity || p.sid}
                    className="relative flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Avatar + Name and Role */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <DrawerParticipantAvatar avatar={p.avatar} name={p.name} />

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {displayName}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                          {roleText}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls & Status OR "So'rov yuborildi" Badge */}
                    {isLocalHost && !isMe && hasPendingRequest ? (
                      <span
                        title="Ishtirokchiga so'rov yuborildi"
                        className="px-3.5 py-1.5 rounded-full bg-[#E8EDFB] dark:bg-[#1E273D] text-[#3B59BA] dark:text-[#7A98F7] text-xs font-semibold select-none shrink-0 animate-in fade-in duration-200"
                      >
                        So'rov yuborildi
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Hand Raised indicator */}
                        {p.hasHandRaised && (
                          <span
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#3B59BA] dark:bg-[#344879] text-white shadow-xs animate-in zoom-in-75 duration-200"
                            title="Qo'l ko'targan"
                          >
                            <HugeiconsIcon icon={HandIcon} size={15} strokeWidth={2} />
                          </span>
                        )}

                      {/* Microphone control / indicator */}
                      {isMe ? (
                        <button
                          type="button"
                          onClick={() => onToggleSelfMic && onToggleSelfMic()}
                          title={p.isMicEnabled ? "Mikrofoningizni o'chirish" : "Mikrofoningizni yoqish"}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer active:scale-90 ${
                            p.isMicEnabled
                              ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white'
                              : 'text-[#EA3323] hover:bg-red-500/10'
                          }`}
                        >
                          <HugeiconsIcon icon={p.isMicEnabled ? Mic01Icon : MicOff01Icon} size={18} strokeWidth={2} />
                        </button>
                      ) : isLocalHost ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (p.isMicEnabled) {
                              onMuteParticipant && onMuteParticipant(p.identity)
                            } else {
                              onAskUnmuteParticipant && onAskUnmuteParticipant(p.identity)
                            }
                          }}
                          title={p.isMicEnabled ? `${p.name || 'Ishtirokchi'} ovozini o'chirish` : `${p.name || 'Ishtirokchi'}dan mikrofonni yoqishni so'rash`}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-90 ${
                            p.isMicEnabled
                              ? 'text-slate-400 dark:text-slate-500 hover:bg-red-500/15 hover:text-red-500'
                              : 'hover:bg-slate-100 dark:hover:bg-white/10 text-[#EA3323]'
                          }`}
                        >
                          <HugeiconsIcon icon={p.isMicEnabled ? Mic01Icon : MicOff01Icon} size={18} strokeWidth={2} />
                        </button>
                      ) : (
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                            p.isMicEnabled
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-[#EA3323]'
                          }`}
                          title={p.isMicEnabled ? 'Mikrofon yoniq' : "Mikrofon o'chiq"}
                        >
                          <HugeiconsIcon icon={p.isMicEnabled ? Mic01Icon : MicOff01Icon} size={18} strokeWidth={2} />
                        </span>
                      )}

                      {/* Camera control / indicator */}
                      {isMe ? (
                        <button
                          type="button"
                          onClick={() => onToggleSelfCamera && onToggleSelfCamera()}
                          title={p.isCameraEnabled ? "Kamerangizni o'chirish" : "Kamerangizni yoqish"}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer active:scale-90 ${
                            p.isCameraEnabled
                              ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white'
                              : 'text-[#EA3323] hover:bg-red-500/10'
                          }`}
                        >
                          <HugeiconsIcon icon={p.isCameraEnabled ? Video01Icon : VideoOffIcon} size={18} strokeWidth={2} />
                        </button>
                      ) : isLocalHost ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (p.isCameraEnabled) {
                              onTurnOffCamera && onTurnOffCamera(p.identity)
                            } else {
                              onAskTurnOnCamera && onAskTurnOnCamera(p.identity)
                            }
                          }}
                          title={p.isCameraEnabled ? `${p.name || 'Ishtirokchi'} kamerasini o'chirish` : `${p.name || 'Ishtirokchi'}dan kamerani yoqishni so'rash`}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-90 ${
                            p.isCameraEnabled
                              ? 'text-slate-400 dark:text-slate-500 hover:bg-red-500/15 hover:text-red-500'
                              : 'hover:bg-slate-100 dark:hover:bg-white/10 text-[#EA3323]'
                          }`}
                        >
                          <HugeiconsIcon icon={p.isCameraEnabled ? Video01Icon : VideoOffIcon} size={18} strokeWidth={2} />
                        </button>
                      ) : (
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                            p.isCameraEnabled
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-[#EA3323]'
                          }`}
                          title={p.isCameraEnabled ? 'Kamera yoniq' : "Kamera o'chiq"}
                        >
                          <HugeiconsIcon icon={p.isCameraEnabled ? Video01Icon : VideoOffIcon} size={18} strokeWidth={2} />
                        </span>
                      )}

                      {/* 3-Dots Action Menu Trigger (for host) */}
                      {isLocalHost && !isMe && !p.isHost && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuIdentity(isMenuOpen ? null : p.identity)
                          }}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer active:scale-90 ${
                            isMenuOpen ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : ''
                          }`}
                          title="Qo'shimcha amallar"
                        >
                          <FaEllipsisVertical size={15} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Floating Dropdown Menu (Screenshot 1) */}
                  {isMenuOpen && isLocalHost && !isMe && !p.isHost && (
                    <div className="absolute right-0 top-10 w-56 bg-white dark:bg-[#181C24] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Item 1: Mikrofonni o'chirish / yoqish */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuIdentity(null)
                          if (p.isMicEnabled) {
                            onMuteParticipant && onMuteParticipant(p.identity)
                          } else {
                            onAskUnmuteParticipant && onAskUnmuteParticipant(p.identity)
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                      >
                        <HugeiconsIcon icon={p.isMicEnabled ? Mic01Icon : MicOff01Icon} size={17} strokeWidth={2} className="text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>{p.isMicEnabled ? "Mikrofonni o'chirish" : "Mikrofonni yoqishni so'rash"}</span>
                      </button>

                      {/* Item 2: Kamerani o'chirish / yoqish */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuIdentity(null)
                          if (p.isCameraEnabled) {
                            onTurnOffCamera && onTurnOffCamera(p.identity)
                          } else {
                            onAskTurnOnCamera && onAskTurnOnCamera(p.identity)
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                      >
                        <HugeiconsIcon icon={p.isCameraEnabled ? Video01Icon : VideoOffIcon} size={17} strokeWidth={2} className="text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>{p.isCameraEnabled ? "Kamerani o'chirish" : "Kamerani yoqishni so'rash"}</span>
                      </button>

                      {/* Item 3: Majlisdan chiqarish (Red button) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuIdentity(null)
                          setRemoveTargetParticipant(p)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#DC2626] bg-[#FEF2F2] dark:bg-red-950/30 hover:bg-[#FEE2E2] dark:hover:bg-red-950/50 transition-colors cursor-pointer text-left mt-1"
                      >
                        <FaUserXmark size={15} className="text-[#DC2626] shrink-0" />
                        <span>Majlisdan chiqarish</span>
                      </button>
                    </div>
                  )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Ishtirokchini chiqarasizmi? (Screenshot 2) */}
      {removeTargetParticipant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150 font-['Manrope',sans-serif]">
          <div className="bg-white dark:bg-[#12161F] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 w-full max-w-[440px] p-6 space-y-4 animate-in zoom-in-95 duration-150 relative">
            {/* Top Red Icon (User cross) */}
            <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#DC2626] flex items-center justify-center">
              <FaUserXmark size={22} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ishtirokchini chiqarasizmi?
            </h3>

            {/* Participant Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#181C24] p-3 sm:p-3.5 rounded-2xl flex items-center gap-3 border border-slate-200/60 dark:border-white/5">
              <DrawerParticipantAvatar avatar={removeTargetParticipant.avatar} name={removeTargetParticipant.name} />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {removeTargetParticipant.name || 'Ishtirokchi'}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                  {removeTargetParticipant.isHost ? 'Tashkilotchi' : 'Ishtirokchi'}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {removeTargetParticipant.name || 'Ishtirokchi'} majlisdan chiqariladi. Havola orqali qayta kirmoqchi bo'lsa, sizning tasdiqingiz kerak bo'ladi.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemoveTargetParticipant(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#1E2430] hover:bg-slate-50 dark:hover:bg-[#283040] text-slate-700 dark:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <FaXmark size={13} />
                <span>Bekor qilish</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = removeTargetParticipant
                  setRemoveTargetParticipant(null)
                  onRemoveParticipant && onRemoveParticipant(target)
                }}
                className="px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <FaUserXmark size={14} />
                <span>Chiqarish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
