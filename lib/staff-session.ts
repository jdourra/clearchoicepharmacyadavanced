const STAFF_SESSION_KEY = "staff_session_id"

export function saveStaffSession(sessionId: string) {
  try {
    localStorage.setItem(STAFF_SESSION_KEY, sessionId)
  } catch {
    // localStorage unavailable
  }
  try {
    document.cookie = `staff_session_id=${sessionId}; path=/; max-age=2592000; samesite=lax`
  } catch {
    // cookie unavailable
  }
}

export function getStaffSession(): string | null {
  try {
    const id = localStorage.getItem(STAFF_SESSION_KEY)
    if (id) return id
  } catch {
    // localStorage unavailable
  }
  try {
    const match = document.cookie.match(/staff_session_id=([^;]+)/)
    if (match) return match[1]
  } catch {
    // cookie unavailable
  }
  return null
}

export function clearStaffSession() {
  try {
    localStorage.removeItem(STAFF_SESSION_KEY)
  } catch {
    // localStorage unavailable
  }
  try {
    document.cookie = "staff_session_id=; path=/; max-age=0"
  } catch {
    // cookie unavailable
  }
}

export function staffAuthFetch(url: string, init?: RequestInit): Promise<Response> {
  const sessionId = getStaffSession()
  const headers = new Headers(init?.headers)
  if (sessionId) {
    headers.set("Authorization", `Bearer ${sessionId}`)
  }
  return fetch(url, { ...init, headers, credentials: "include" })
}
