// Client-side session management
// Uses localStorage as the primary storage (works in iframes where cookies are blocked)
// Also sets a cookie as a fallback for environments where cookies work

const SESSION_KEY = "session_id"

export function saveSession(sessionId: string) {
  try {
    localStorage.setItem(SESSION_KEY, sessionId)
  } catch {
    // localStorage unavailable
  }
  try {
    document.cookie = `session_id=${sessionId}; path=/; max-age=2592000; samesite=lax`
  } catch {
    // cookie unavailable
  }
}

export function getSession(): string | null {
  // Try localStorage first
  try {
    const id = localStorage.getItem(SESSION_KEY)
    if (id) return id
  } catch {
    // localStorage unavailable
  }
  // Fallback to cookie
  try {
    const match = document.cookie.match(/session_id=([^;]+)/)
    if (match) return match[1]
  } catch {
    // cookie unavailable
  }
  return null
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // localStorage unavailable
  }
  try {
    document.cookie = "session_id=; path=/; max-age=0"
  } catch {
    // cookie unavailable
  }
}

// Build headers object for authenticated fetch calls
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  const sessionId = getSession()
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`
  }
  return headers
}

// Convenience wrapper: authenticated fetch
export function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const sessionId = getSession()
  const headers = new Headers(init?.headers)
  if (sessionId) {
    headers.set("Authorization", `Bearer ${sessionId}`)
  }
  return fetch(url, { ...init, headers, credentials: "include" })
}
