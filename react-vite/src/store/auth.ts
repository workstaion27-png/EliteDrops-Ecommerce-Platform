import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  isAdmin: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      
      setUser: (user) => set({ 
        user, 
        isAdmin: user?.role === 'admin' 
      }),
      
      logout: () => set({ user: null, isAdmin: false }),
    }),
    {
      name: 'elitedrops-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
