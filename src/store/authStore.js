import { create } from 'zustand'

const useAuthStore = create((set) => ({
  session: null,
  user: null,
  role: null,
  loading: true,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    loading: false,
  }),

  setRole: (role) => set({ role }),

  clearAuth: () => set({
    session: null,
    user: null,
    role: null,
    loading: false,
  }),
}))

export default useAuthStore
