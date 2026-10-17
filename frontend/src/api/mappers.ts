import type { ApiArtwork, ApiComment, ApiUser } from '../types/api'
import type { Artwork, Comment, User } from '../types/canvas'
import { avatarUrl } from '../utils/avatar'

export function toUser(u: ApiUser): User {
	return {
		id: u.id,
		name: u.username,
		username: u.username,
		email: u.email,
		createdAt: u.createdAt,
		avatar: avatarUrl(u.username),
	}
}

export function toArtwork(a: ApiArtwork): Artwork {
	return {
		id: a.id,
		artistId: a.artistId,
		title: a.title,
		image: a.imageUrl,
		medium: a.medium,
		genre: a.genre,
		description: a.description ?? '',
		feedbackOn: a.focus,
		createdAt: a.createdAt,
		commentCount: a._count?.comments,
	}
}

export function toComment(c: ApiComment): Comment {
	return {
		id: c.id,
		artworkId: c.artworkId,
		authorId: c.authorId,
		body: c.content,
		createdAt: c.createdAt,
	}
}