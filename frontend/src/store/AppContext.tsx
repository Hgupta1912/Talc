import type { ReactNode } from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import * as mock from '../data/mock'
import type {
	Artwork,
	Comment,
	CommentInput,
	CritiqueSummary,
	NewArtwork,
	SignupInput,
	Toast,
	User,
} from '../types/canvas'
import { avatarUrl } from '../utils/avatar'

interface AppState {
	users: Record<string, User>
	currentUser: User | null
	artworks: Artwork[]
	comments: Comment[]
	summaries: CritiqueSummary[]
	helpfulVotes: Set<string>
	toasts: Toast[]
	login: (userId?: string) => void
	signup: (input: SignupInput) => void
	logout: () => void
	updateProfile: (patch: Partial<User>) => void
	createArtwork: (data: NewArtwork) => Artwork
	deleteArtwork: (artworkId: string) => void
	addComment: (artworkId: string, input: CommentInput) => void
	editComment: (commentId: string, input: CommentInput) => void
	deleteComment: (commentId: string) => void
	toggleHelpful: (commentId: string) => void
	toast: (message: string) => void
}

const AppContext = createContext<AppState | null>(null)

let idCounter = 100
const newId = (prefix: string) => `${prefix}${++idCounter}`

export function AppProvider({ children }: { children: ReactNode }) {
	const [users, setUsers] = useState<Record<string, User>>(mock.users)
	const [currentUserId, setCurrentUserId] = useState<string | null>(
		mock.CURRENT_USER_ID,
	)
	const [artworks, setArtworks] = useState<Artwork[]>(mock.artworks)
	const [comments, setComments] = useState<Comment[]>(mock.comments)
	const [summaries] = useState<CritiqueSummary[]>(mock.critiqueSummaries)
	const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(() => new Set())
	const [toasts, setToasts] = useState<Toast[]>([])

	const currentUser = currentUserId ? (users[currentUserId] ?? null) : null

	const toast = useCallback((message: string) => {
		const id = newId('t')
		setToasts((t) => [...t, { id, message }])
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
	}, [])

	const value = useMemo<AppState>(() => {
		// ---------- auth (fake for now) ----------
		const login = (userId: string = mock.CURRENT_USER_ID) =>
			setCurrentUserId(userId)
		const signup = ({ name, email }: SignupInput) => {
			const id = newId('u')
			const username = (email.split('@')[0] || name)
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '')
			setUsers((u) => ({
				...u,
				[id]: {
					id,
					name,
					username,
					avatar: avatarUrl(username),
					location: '',
					bio: '',
					website: '',
				},
			}))
			setCurrentUserId(id)
		}
		const logout = () => setCurrentUserId(null)
		const updateProfile = (patch: Partial<User>) => {
			if (!currentUserId) return
			setUsers((u) => ({
				...u,
				[currentUserId]: { ...u[currentUserId], ...patch },
			}))
			toast('Profile updated')
		}

		const createArtwork = (data: NewArtwork): Artwork => {
			const art: Artwork = {
				id: newId('a'),
				artistId: currentUserId ?? '',
				createdAt: new Date().toISOString(),
				mediumLabel: data.medium,
				...data,
			}
			setArtworks((a) => [art, ...a])
			toast('Artwork published')
			return art
		}
		const deleteArtwork = (artworkId: string) => {
			setArtworks((a) => a.filter((x) => x.id !== artworkId))
			setComments((c) => c.filter((x) => x.artworkId !== artworkId)) // also delete its comments
			toast('Artwork deleted')
		}

		const addComment = (artworkId: string, { body, tags }: CommentInput) => {
			if (!currentUserId) return
			const comment: Comment = {
				id: newId('c'),
				artworkId,
				authorId: currentUserId,
				body,
				tags,
				helpful: 0,
				createdAt: new Date().toISOString(),
			}
			setComments((c) => [comment, ...c])
			toast('Critique posted')
		}
		const editComment = (commentId: string, { body, tags }: CommentInput) => {
			setComments((c) =>
				c.map((x) =>
					x.id === commentId ? { ...x, body, tags, edited: true } : x,
				),
			)
			toast('Comment updated')
		}
		const deleteComment = (commentId: string) => {
			setComments((c) => c.filter((x) => x.id !== commentId))
			toast('Comment deleted')
		}
		const toggleHelpful = (commentId: string) => {
			const voted = helpfulVotes.has(commentId)
			setHelpfulVotes((s) => {
				const next = new Set(s)
				if (voted) next.delete(commentId)
				else next.add(commentId)
				return next
			})
			setComments((c) =>
				c.map((x) =>
					x.id === commentId
						? { ...x, helpful: x.helpful + (voted ? -1 : 1) }
						: x,
				),
			)
		}

		return {
			users,
			currentUser,
			artworks,
			comments,
			summaries,
			helpfulVotes,
			toasts,
			login,
			signup,
			logout,
			updateProfile,
			createArtwork,
			deleteArtwork,
			addComment,
			editComment,
			deleteComment,
			toggleHelpful,
			toast,
		}
	}, [
		users,
		currentUser,
		currentUserId,
		artworks,
		comments,
		summaries,
		helpfulVotes,
		toasts,
		toast,
	])

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
	const ctx = useContext(AppContext)
	if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
	return ctx
}
