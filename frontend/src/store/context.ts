import { createContext } from 'react'
import type {
    Artwork,
    Comment,
    LoginInput,
    NewArtwork,
    SignupInput,
    Toast,
    User,
} from '../types/canvas'

export interface Profile {
	user: User
	artworks: Artwork[]
}

export interface AppState {
	users: Record<string, User>
	currentUser: User | null
    token: string | null
	authLoading: boolean
	artworks: Artwork[]
	feedLoading: boolean
	comments: Comment[]
	toasts: Toast[]

	login: (input: LoginInput) => Promise<boolean>
	signup: (input: SignupInput) => Promise<boolean>
	logout: () => void
	updateUsername: (username: string) => Promise<boolean>

	loadFeed: () => Promise<void>
	loadArtwork: (id: string) => Promise<Artwork | null>
	loadProfile: (username: string | 'me') => Promise<Profile | null>
	createArtwork: (data: NewArtwork) => Promise<Artwork | null>
	deleteArtwork: (artworkId: string) => Promise<boolean>

	loadComments: (artworkId: string) => Promise<void>
	addComment: (artworkId: string, body: string) => Promise<boolean>
	editComment: (comment: Comment, body: string) => Promise<boolean>
	deleteComment: (comment: Comment) => Promise<boolean>

	toast: (message: string) => void
}

export const AppContext = createContext<AppState | null>(null)