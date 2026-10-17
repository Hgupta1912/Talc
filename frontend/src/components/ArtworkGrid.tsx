import { MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/useApp'
import type { Artwork } from '../types/canvas'
import { Avatar, ConfirmDialog, KebabMenu } from './ui'

interface ArtworkCardProps {
	artwork: Artwork
	manageable?: boolean
}

export function ArtworkCard({ artwork, manageable = false }: ArtworkCardProps) {
	const { users, deleteArtwork } = useApp()
	const [confirming, setConfirming] = useState(false)
	const navigate = useNavigate()
	const artist = users[artwork.artistId]

	return (
		<div className="group relative mb-3.5 break-inside-avoid">
			<Link
				to={`/art/${artwork.id}`}
				className="block overflow-hidden rounded-2xl bg-blush-deep"
			>
				<img
					src={artwork.image}
					alt={artwork.title}
					loading="lazy"
					className="block w-full transition duration-500 group-hover:scale-[1.03]"
				/>
				<div className="pointer-events-none absolute inset-0 flex flex-col justify-end rounded-2xl bg-gradient-to-t from-black/65 via-black/0 to-black/0 p-3 opacity-0 transition duration-300 group-hover:opacity-100">
					<p className="truncate font-display text-sm font-bold text-white">
						{artwork.title}
					</p>
					<div className="mt-1.5 flex items-center justify-between text-xs text-white/90">
						<span className="flex min-w-0 items-center gap-1.5">
							<Avatar user={artist} size={18} />
							<span className="truncate">{artist?.name}</span>
						</span>
						{artwork.commentCount !== undefined && (
							<span className="flex items-center gap-1">
								<MessageCircle size={13} /> {artwork.commentCount}
							</span>
						)}
					</div>
				</div>
			</Link>

			{manageable && (
				<>
					<KebabMenu
						className="absolute right-2 top-2"
						buttonClass="bg-cream/95 shadow-sm hover:!bg-white"
						items={[
							{
								label: 'Open',
								icon: Pencil,
								onClick: () => navigate(`/art/${artwork.id}`),
							},
							{
								label: 'Delete',
								icon: Trash2,
								danger: true,
								onClick: () => setConfirming(true),
							},
						]}
					/>
					<ConfirmDialog
						open={confirming}
						onClose={() => setConfirming(false)}
						title="Delete this artwork?"
						message="This will also remove all of its comments. This action cannot be undone."
						onConfirm={() => deleteArtwork(artwork.id)}
					/>
				</>
			)}
		</div>
	)
}

interface MasonryGridProps {
	artworks: Artwork[]
	manageable?: boolean
}

export function MasonryGrid({
	artworks,
	manageable = false,
}: MasonryGridProps) {
	return (
		<div className="columns-2 gap-3.5 sm:columns-3 lg:columns-5">
			{artworks.map((a) => (
				<ArtworkCard key={a.id} artwork={a} manageable={manageable} />
			))}
		</div>
	)
}

export function MasonrySkeleton({ count = 10 }: { count?: number }) {
	const heights = [260, 190, 190, 190, 230, 260, 260, 260, 260, 190]
	return (
		<div className="columns-2 gap-3.5 sm:columns-3 lg:columns-5">
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="skeleton mb-3.5 break-inside-avoid rounded-2xl"
					style={{ height: heights[i % heights.length] }}
				/>
			))}
		</div>
	)
}
