import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, api } from '../api/client'
import { toArtwork, toComment, toUser } from '../api/mappers'
import type {
	ApiArtwork,
	ApiAuthResponse,
	ApiComment,
	ApiProfile,
	ApiUser,
	ApiUserRef,
} from '../types/api'
import type {
	Artwork,
	Comment,
	LoginInput,
	NewArtwork,
	SignupInput,
	Toast,
	User,
} from '../types/canvas'
import type { AppState } from './context'
import { AppContext } from './context'

const PERSIST_TOKEN = true
const TOKEN_KEY = 'curve.token'

const readToken = () => {
	if (!PERSIST_TOKEN) return null
	try {
		return localStorage.getItem(TOKEN_KEY)
	} catch {
		return null
	}
}
const writeToken = (token: string | null) => {
	if (!PERSIST_TOKEN) return
	try {
		if (token) localStorage.setItem(TOKEN_KEY, token)
		else localStorage.removeItem(TOKEN_KEY)
	} catch {
	}
}

let toastCounter = 0

export function AppProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(readToken)
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [authLoading, setAuthLoading] = useState(() => Boolean(readToken()))
	const [users, setUsers] = useState<Record<string, User>>({})
	const [artworks, setArtworks] = useState<Artwork[]>([])
	const [feedLoading, setFeedLoading] = useState(true)
	const [comments, setComments] = useState<Comment[]>([])
	const [toasts, setToasts] = useState<Toast[]>([])

	const toast = useCallback((message: string) => {
		const id = `t${++toastCounter}`
		setToasts((t) => [...t, { id, message }])
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
	}, [])

	const rememberUsers = useCallback((refs: (ApiUserRef | ApiUser)[]) => {
		setUsers((prev) => {
			const next = { ...prev }
			for (const r of refs) next[r.id] = { ...next[r.id], ...toUser(r) }
			return next
		})
	}, [])

	const upsertArtworks = useCallback((incoming: Artwork[]) => {
		setArtworks((prev) => {
			const byId = new Map(prev.map((a) => [a.id, a]))
			for (const a of incoming) {
				const old = byId.get(a.id)
				byId.set(a.id, {
					...old,
					...a,
					commentCount: a.commentCount ?? old?.commentCount,
				})
			}
			return [...byId.values()].sort(
				(x, y) =>
					new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
			)
		})
	}, [])

	const bumpCommentCount = useCallback((artworkId: string, delta: number) => {
		setArtworks((prev) =>
			prev.map((a) =>
				a.id === artworkId && a.commentCount !== undefined
					? { ...a, commentCount: Math.max(0, a.commentCount + delta) }
					: a,
			),
		)
	}, [])

	const startSession = useCallback(
		({ token, user }: ApiAuthResponse) => {
			setToken(token)
			writeToken(token)
			const u = toUser(user)
			setCurrentUser(u)
			rememberUsers([user])
		},
		[rememberUsers],
	)

	const endSession = useCallback(() => {
		setToken(null)
		writeToken(null)
		setCurrentUser(null)
	}, [])

	const attempt = useCallback(
		async <T,>(
			fn: () => Promise<T>,
		): Promise<{ ok: true; data: T } | { ok: false }> => {
			try {
				return { ok: true, data: await fn() }
			} catch (err) {
				const e = err as ApiError
				if (
					token &&
					(e.status === 401 ||
						(e.status === 403 && /token/i.test(e.message)))
				) {
					endSession()
					toast('Your session expired — please log in again.')
				} else {
					toast(e.message || 'Something went wrong')
				}
				return { ok: false }
			}
		},
		[token, endSession, toast],
	)

	useEffect(() => {
		const saved = readToken()
		if (!saved) return
		let cancelled = false
		api<ApiProfile>('/users/me', { token: saved })
			.then((me) => {
				if (cancelled) return
				setCurrentUser(toUser(me))
				rememberUsers([me])
			})
			.catch(() => {
				if (!cancelled) endSession()
			})
			.finally(() => {
				if (!cancelled) setAuthLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [rememberUsers, endSession])

	const value = useMemo<AppState>(() => {
		const login = async (input: LoginInput) => {
			const res = await attempt(() =>
				api<ApiAuthResponse>('/auth/login', { method: 'POST', body: input }),
			)
			if (res.ok) startSession(res.data)
			return res.ok
		}

		const signup = async (input: SignupInput) => {
			const res = await attempt(() =>
				api<ApiAuthResponse>('/auth/signup', { method: 'POST', body: input }),
			)
			if (res.ok) startSession(res.data)
			return res.ok
		}

		const logout = () => endSession()

		const updateUsername = async (username: string) => {
			const res = await attempt(() =>
				api<ApiUser>('/users/me', {
					method: 'PATCH',
					token,
					body: { username },
				}),
			)
			if (!res.ok) return false
			setCurrentUser(toUser(res.data))
			rememberUsers([res.data])
			toast('Profile updated')
			return true
		}

		const loadFeed = async () => {
			setFeedLoading(true)
			const res = await attempt(() => api<ApiArtwork[]>('/artworks'))
			if (res.ok) {
				const list = res.data
				rememberUsers(list.flatMap((a) => (a.artist ? [a.artist] : [])))
				upsertArtworks(list.map(toArtwork))
			}
			setFeedLoading(false)
		}

		const loadArtwork = async (id: string) => {
			try {
				const a = await api<ApiArtwork>(`/artworks/${id}`)
				if (a.artist) rememberUsers([a.artist])
				const art = toArtwork(a)
				upsertArtworks([art])
				return art
			} catch (err) {
				if ((err as ApiError).status !== 404) toast((err as Error).message)
				return null
			}
		}

		const loadProfile = async (username: string | 'me') => {
			try {
				const raw =
					username === 'me'
						? await api<ApiProfile>('/users/me', { token })
						: await api<ApiProfile | { user: ApiProfile }>(
								`/users/${encodeURIComponent(username)}`,
							)
				const p: ApiProfile = 'user' in raw ? raw.user : raw
				rememberUsers([p])
				const art = p.artworks.map((a) => toArtwork({ ...a, artistId: p.id }))
				upsertArtworks(art)
				return { user: toUser(p), artworks: art }
			} catch (err) {
				if ((err as ApiError).status !== 404) toast((err as Error).message)
				return null
			}
		}

		const createArtwork = async (data: NewArtwork) => {
			const form = new FormData()
			form.append('image', data.file)
			form.append('title', data.title)
			form.append('description', data.description)
			form.append('medium', data.medium)
			form.append('genre', data.genre)
			form.append('focus', data.feedbackOn)
			const res = await attempt(() =>
				api<ApiArtwork>('/artworks', { method: 'POST', token, body: form }),
			)
			if (!res.ok) return null
			if (res.data.artist) rememberUsers([res.data.artist])
			const art = toArtwork(res.data)
			upsertArtworks([art])
			toast('Artwork published')
			return art
		}

		const deleteArtwork = async (artworkId: string) => {
			const res = await attempt(() =>
				api<null>(`/artworks/${artworkId}`, { method: 'DELETE', token }),
			)
			if (!res.ok) return false
			setArtworks((a) => a.filter((x) => x.id !== artworkId))
			setComments((c) => c.filter((x) => x.artworkId !== artworkId))
			toast('Artwork deleted')
			return true
		}

		const loadComments = async (artworkId: string) => {
			try {
				const list = await api<ApiComment[]>(`/artworks/${artworkId}/comments`)
				rememberUsers(list.map((c) => c.author))
				setComments((prev) => [
					...prev.filter((c) => c.artworkId !== artworkId),
					...list.map(toComment),
				])
			} catch (err) {
				if ((err as ApiError).status !== 404) toast((err as Error).message)
			}
		}

		const addComment = async (artworkId: string, body: string) => {
			const res = await attempt(() =>
				api<ApiComment>(`/artworks/${artworkId}/comments`, {
					method: 'POST',
					token,
					body: { content: body },
				}),
			)
			if (!res.ok) return false
			rememberUsers([res.data.author])
			setComments((c) => [...c, toComment(res.data)])
			bumpCommentCount(artworkId, 1)
			toast('Critique posted')
			return true
		}

		const editComment = async (comment: Comment, body: string) => {
			const res = await attempt(() =>
				api<ApiComment>(
					`/artworks/${comment.artworkId}/comments/${comment.id}`,
					{ method: 'PATCH', token, body: { content: body } },
				),
			)
			if (!res.ok) return false
			const updated = toComment(res.data)
			setComments((c) => c.map((x) => (x.id === comment.id ? updated : x)))
			toast('Comment updated')
			return true
		}

		const deleteComment = async (comment: Comment) => {
			const res = await attempt(() =>
				api<null>(`/artworks/${comment.artworkId}/comments/${comment.id}`, {
					method: 'DELETE',
					token,
				}),
			)
			if (!res.ok) return false
			setComments((c) => c.filter((x) => x.id !== comment.id))
			bumpCommentCount(comment.artworkId, -1)
			toast('Comment deleted')
			return true
		}

		return {
			users,
			currentUser,
			token,
			authLoading,
			artworks,
			feedLoading,
			comments,
			toasts,
			login,
			signup,
			logout,
			updateUsername,
			loadFeed,
			loadArtwork,
			loadProfile,
			createArtwork,
			deleteArtwork,
			loadComments,
			addComment,
			editComment,
			deleteComment,
			toast,
		}
	}, [
		users,
		currentUser,
		authLoading,
		artworks,
		feedLoading,
		comments,
		toasts,
		token,
		attempt,
		startSession,
		endSession,
		rememberUsers,
		upsertArtworks,
		bumpCommentCount,
		toast,
	])
	
	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}