export interface User {
	id: string
	name: string
	username: string
	avatar: string
	email?: string
	createdAt?: string
}

export interface Artwork {
	id: string
	artistId: string
	title: string
	image: string
	medium: string
	genre: string
	description: string
	feedbackOn: string
	createdAt: string
	/** Undefined when the backend didn't include a count (e.g. profile responses). */
	commentCount?: number
}

export interface Comment {
	id: string
	artworkId: string
	authorId: string
	body: string
	createdAt: string
}

export interface Toast {
	id: string
	message: string
}

/** What the upload form sends to createArtwork. */
export interface NewArtwork {
	file: File
	title: string
	description: string
	medium: string
	genre: string
	feedbackOn: string
}

export interface SignupInput {
	username: string
	email: string
	password: string
}

export interface LoginInput {
	email: string
	password: string
}