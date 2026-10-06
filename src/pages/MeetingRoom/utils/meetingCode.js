/**
 * Meeting code and URL helpers
 * URL format: /join/<code-or-uid>
 * For example: code="uzt-wvee-ulb" => "/join/uzt-wvee-ulb"
 */

/**
 * Returns the slug / code to use in the URL.
 * Prefers code, then uid, falls back to id.
 */
export function getMeetingCode(idOrCode, uid, code) {
  if (typeof idOrCode === 'object' && idOrCode !== null) {
    const obj = idOrCode
    return getMeetingCode(obj.code || obj.uid || obj.id)
  }
  if (code && String(code).trim()) {
    return String(code).trim().toLowerCase()
  }
  if (idOrCode && typeof idOrCode === 'string' && /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/i.test(idOrCode.trim())) {
    return String(idOrCode).trim().toLowerCase()
  }
  if (uid && String(uid).trim()) {
    return String(uid).trim().toLowerCase()
  }
  if (idOrCode !== undefined && idOrCode !== null && String(idOrCode).trim()) {
    return String(idOrCode).trim()
  }
  return ''
}

/**
 * Parses the numeric meeting id from a URL param.
 * Handles both pure numeric ids ("224") and uid-style strings ("mt-511").
 * Returns numeric string if found, else null (code/uid needs a backend lookup).
 */
export function parseMeetingId(param) {
  if (!param) return null
  const str = String(param).trim()

  // Pure numeric e.g. "224"
  if (/^\d+$/.test(str)) {
    return str
  }

  return null
}

export function getFullMeetingUrl(id, uid, code) {
  const c = getMeetingCode(id, uid, code)
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://muloqot.raqamlinazorat.uz'
  return c ? `${origin}/join/${c}` : `${origin}/join`
}

/**
 * Formats relative avatar URLs to absolute media URLs
 * Strips /api suffix from VITE_BASE_URL so media files are loaded from host root
 */
export function formatAvatarUrl(url) {
  if (!url) return ''
  if (typeof url === 'object') {
    url = url.url || url.file || url.path || url.avatar || ''
  }
  if (typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return ''
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }
  const rawBase = import.meta.env.VITE_BASE_URL || ''
  const cleanBase = rawBase.replace(/\/api\/?$/i, '').replace(/\/+$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath
}

export function getAvatarGradient(name = '') {
  const gradients = [
    'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
    'bg-gradient-to-br from-[#10B981] to-[#059669]',
    'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]',
    'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
    'bg-gradient-to-br from-[#06B6D4] to-[#0891B2]',
    'bg-gradient-to-br from-[#EC4899] to-[#DB2777]',
    'bg-gradient-to-br from-[#6366F1] to-[#4338CA]',
    'bg-gradient-to-br from-[#14B8A6] to-[#0F766E]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

