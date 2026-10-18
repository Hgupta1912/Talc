export interface ApiUserRef {
	id: string
	username: string
}

export interface ApiUser extends ApiUserRef {
	email?: string
	createdAt?: string
}

export interface ApiArtwork {
	id: string
	title: string
	description: string | null
	medium: string
	genre: string
	focus: string
	imageUrl: string
	artistId: string
	createdAt: string
	artist?: ApiUserRef
	_count?: { comments: number }
}

export interface ApiProfile extends ApiUser {
	artworks: ApiArtwork[]
}

export interface ApiComment {
	id: string
	content: string
	createdAt: string
	authorId: string
	artworkId: string
	author: ApiUserRef
}

export interface ApiAuthResponse {
	token: string
	user: ApiUser
}

export interface ApiCritiqueSummary {
	id: string
	artworkId: string
	strengths: string[]
	improvements: string[]
	suggestions: string[]
	commentCount: number
	generatedAt: string
}