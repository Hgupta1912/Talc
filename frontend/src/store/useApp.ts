import { useContext } from 'react'
import type { AppState } from './context'
import { AppContext } from './context'

export function useApp(): AppState {
	const ctx = useContext(AppContext)
	if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
	return ctx
}