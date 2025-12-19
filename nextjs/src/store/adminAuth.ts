import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminSession {
  isAuthenticated: boolean
  username: string
  loginTime: number
  lastActivity: number
  token?: string
}

interface AdminAuthStore {
  session: AdminSession | null
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  logout: () => void
  checkSession: () => boolean
  updateActivity: () => void
  getSessionDuration: () => number
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'elitedrops_admin_2024'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!@#'
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '3600') // 1 hour

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      session: null,

      login: async (credentials: { username: string; password: string }) => {
        try {
          // التحقق من صحة البيانات
          if (
            credentials.username === ADMIN_USERNAME &&
            credentials.password === ADMIN_PASSWORD
          ) {
            const session: AdminSession = {
              isAuthenticated: true,
              username: credentials.username,
              loginTime: Date.now(),
              lastActivity: Date.now(),
              token: generateSecureToken()
            }

            set({ session })
            
            // حفظ في localStorage للإضافة للأمان
            if (typeof window !== 'undefined') {
              localStorage.setItem('admin_session', JSON.stringify(session))
            }
            
            return true
          }
          
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      logout: () => {
        set({ session: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_session')
          localStorage.removeItem('admin_token')
        }
      },

      checkSession: () => {
        const session = get().session
        
        if (!session) {
          // محاولة استرجاع الجلسة من localStorage
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('admin_session')
            if (stored) {
              try {
                const parsedSession = JSON.parse(stored)
                const now = Date.now()
                const sessionDuration = now - parsedSession.loginTime
                
                // التحقق من انتهاء صلاحية الجلسة
                if (sessionDuration < SESSION_TIMEOUT * 1000) {
                  set({ session: { ...parsedSession, lastActivity: now } })
                  return true
                } else {
                  localStorage.removeItem('admin_session')
                  localStorage.removeItem('admin_token')
                }
              } catch (error) {
                localStorage.removeItem('admin_session')
                localStorage.removeItem('admin_token')
              }
            }
          }
          return false
        }

        // التحقق من انتهاء صلاحية الجلسة
        const now = Date.now()
        const sessionDuration = now - session.loginTime
        const idleTime = now - session.lastActivity
        
        if (sessionDuration >= SESSION_TIMEOUT * 1000 || idleTime > 30 * 60 * 1000) {
          get().logout()
          return false
        }

        return true
      },

      updateActivity: () => {
        const session = get().session
        if (session && session.isAuthenticated) {
          const updatedSession = { ...session, lastActivity: Date.now() }
          set({ session: updatedSession })
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_session', JSON.stringify(updatedSession))
          }
        }
      },

      getSessionDuration: () => {
        const session = get().session
        if (!session) return 0
        return Date.now() - session.loginTime
      }
    }),
    {
      name: 'admin-auth-storage',
      // لا نحفظ الجلسة في localStorage للخصوصية
      partialize: () => ({})
    }
  )
)

// دالة لتوليد token آمن
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// دوال مساعدة للأمان
export const securityUtils = {
  // التحقق من قوة كلمة المرور
  isStrongPassword: (password: string): boolean => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    )
  },

  // تشفير بسيط (في الإنتاج استخدم bcrypt)
  hashPassword: (password: string): string => {
    // هذا تشفير بسيط - في الإنتاج استخدم bcrypt أو argon2
    return btoa(password + 'salt_2024')
  },

  // التحقق من صحة token
  validateToken: (token: string): boolean => {
    return token && token.length === 64 && /^[A-Za-z0-9]+$/.test(token)
  },

  // تسجيل محاولات الدخول المشبوهة
  logSuspiciousActivity: (activity: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      activity,
      details,
      ip: typeof window !== 'undefined' ? 'client-side' : 'server-side'
    }
    
    console.warn('🚨 Admin Security Alert:', logEntry)
    
    // في الإنتاج، أرسل هذا إلى نظام المراقبة
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_log', JSON.stringify(logEntry))
    }
  }
}