export interface User {
	id: string
	name: string
	username: string
	avatar: string
	location: string
	bio: string
	website: string
}

export interface Artwork {
	id: string
	artistId: string
	title: string
	image: string
	medium: string
	mediumLabel?: string
	description: string
	feedbackOn: string
	tags: string[]
	dimensions?: string
	createdAt: string
}

export interface Comment {
	id: string
	artworkId: string
	authorId: string
	body: string
	tags: string[]
	helpful: number
	createdAt: string
	edited?: boolean
}

export interface Toast {
	id: string
	message: string
}

export type NewArtwork = Pick<
	Artwork,
	'title' | 'description' | 'medium' | 'feedbackOn' | 'tags' | 'image'
>

export interface CommentInput {
	body: string
	tags: string[]
}

export interface SignupInput {
	name: string
	email: string
	password: string
}

export interface CritiqueSummary {
	id: string
	artworkId: string
	strengths: string[]
	improvements: string[]
	suggestions: string[]
	commentCount: number
	generatedAt: string
}