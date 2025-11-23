// // zustand 전역 상태 관리 (TypeScript + Next.js)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Role = 'guest' | 'member' | 'admin'

type User = {
    idx: number
    email: string
    nickname: string
    role: Role
}

type AuthState = {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isLoggedIn: boolean
    // actions
    login: (payload: {
        user: User;
        accessToken: string;
        refreshToken: string;
    }) => void
    logout: () => void
    updateNickname: (nickname: string) => void
    updateAccessToken: (accessToken: string) => void
}

export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,

            login: ({ user, accessToken, refreshToken }) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isLoggedIn: true,
                }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isLoggedIn: false,
                }),

            updateNickname: (nickname) =>
                set((state) => 
                    state.user
                    ? { user: { ...state.user, nickname } }
                    : state
            ),

            updateAccessToken: (accessToken) =>
                set({ accessToken }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
            // 저장할 ㅣㄹ드만 선택 (예: 로딩 상태 같은 건 안 저장)
            partialize: (state) => ({ 
                user: state.user, 
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isLoggedIn: state.isLoggedIn 
            } as AuthState),
        }
    )
)