import { create } from 'zustand'

interface AdminSession {
  isAuthenticated: boolean
  username: string
  token: string
  loginTime: number
  lastActivity: number
}

interface AdminAuthState {
  session: AdminSession | null
  
  // Actions
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  logout: () => void
  checkSession: () => boolean
  updateActivity: () => void
  validateToken: (token: string) => boolean
}

// Helper function to generate a secure token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Helper function to validate token format
function isValidTokenFormat(token: string): boolean {
  return typeof token === 'string' && token.length === 64 && /^[A-Za-z0-9]+$/.test(token)
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  session: null,

  login: async (credentials: { username: string; password: string }): Promise<boolean> => {
    // قراءة بيانات تسجيل الدخول من متغيرات البيئة
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'luxuryhub_admin_2024'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LuxuryAdminPass123'

    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      const session: AdminSession = {
        isAuthenticated: true,
        username: credentials.username,
        token: generateToken(),
        loginTime: Date.now(),
        lastActivity: Date.now(),
      }

      // حفظ الجلسة في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxuryhub_admin_session', JSON.stringify(session))
      }

      set({ session })
      return true
    }

    return false
  },

  logout: () => {
    // حذف الجلسة من localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luxuryhub_admin_session')
    }
    
    set({ session: null })
  },

  checkSession: (): boolean => {
    const { session } = get()
    
    if (!session) {
      // محاولة استرجاع الجلسة من localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('luxuryhub_admin_session')
          if (stored) {
            const parsedSession = JSON.parse(stored)
            
            // التحقق من صحة الجلسة
            const now = Date.now()
            const sessionTimeout = 3600 * 1000 // 1 hour
            const idleTimeout = 30 * 60 * 1000 // 30 minutes
            
            if (
              parsedSession.isAuthenticated &&
              parsedSession.token &&
              isValidTokenFormat(parsedSession.token) &&
              now - parsedSession.loginTime < sessionTimeout &&
              now - parsedSession.lastActivity < idleTimeout
            ) {
              set({ session: parsedSession })
              return true
            } else {
              // جلسة منتهية الصلاحية، حذفها
              localStorage.removeItem('luxuryhub_admin_session')
            }
          }
        } catch (error) {
          console.error('Error parsing stored session:', error)
          localStorage.removeItem('luxuryhub_admin_session')
        }
      }
      return false
    }

    // التحقق من انتهاء صلاحية الجلسة
    const now = Date.now()
    const sessionTimeout = 3600 * 1000 // 1 hour
    const idleTimeout = 30 * 60 * 1000 // 30 minutes
    
    if (now - session.loginTime > sessionTimeout || now - session.lastActivity > idleTimeout) {
      get().logout()
      return false
    }

    return true
  },

  updateActivity: () => {
    const { session } = get()
    if (session) {
      const updatedSession = {
        ...session,
        lastActivity: Date.now()
      }
      
      // تحديث في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxuryhub_admin_session', JSON.stringify(updatedSession))
      }
      
      set({ session: updatedSession })
    }
  },

  validateToken: (token: string): boolean => {
    return typeof token === 'string' && token.length === 64 && /^[A-Za-z0-9]+$/.test(token)
  },
}))