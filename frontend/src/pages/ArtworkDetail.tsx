import { ChevronLeft, ChevronRight, Link2, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MasonryGrid } from '../components/ArtworkGrid'
import Critiques from '../components/Critiques'
import type { MenuItem } from '../components/ui'
import { Avatar, ConfirmDialog, KebabMenu, TagChip } from '../components/ui'
import { useApp } from '../store/useApp'
import NotFound from './NotFound'

function Lightbox({
	src,
	alt,
	onClose,
}: {
	src: string
	alt: string
	onClose: () => void
}) {
	useEffect(() => {
		const k = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', k)
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', k)
			document.body.style.overflow = ''
		}
	}, [onClose])
	return (
		<div
			className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4 sm:p-10"
			onClick={onClose}
		>
			<button
				aria-label="Close"
				className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
			>
				<X size={20} />
			</button>
			<img
				src={src}
				alt={alt}
				className="max-h-full max-w-full rounded-xl object-contain"
			/>
		</div>
	)
}

export default function ArtworkDetail() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const {
		artworks,
		users,
		currentUser,
		deleteArtwork,
		loadArtwork,
		loadComments,
		toast,
	} = useApp()
	const [expanded, setExpanded] = useState(false)
	const [confirming, setConfirming] = useState(false)
	const [loaded, setLoaded] = useState<{ id: string; found: boolean } | null>(
		null,
	)
	const status =
		!loaded || loaded.id !== id ? 'loading' : loaded.found ? 'ready' : 'missing'

	useEffect(() => {
		if (!id) return
		let cancelled = false
		Promise.all([loadArtwork(id), loadComments(id)]).then(([art]) => {
			if (!cancelled) setLoaded({ id, found: Boolean(art) })
		})
		return () => {
			cancelled = true
		}
	}, [id])

	const art = artworks.find((a) => a.id === id)
	const artist = art ? users[art.artistId] : undefined
	if (!art || !artist) {
		if (status === 'loading')
			return (
				<div className="mx-auto max-w-[1120px] px-4 pt-12 sm:px-6">
					<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
						<div className="skeleton aspect-square rounded-3xl" />
						<div className="space-y-4 pt-5">
							<div className="skeleton h-4 w-32 rounded" />
							<div className="skeleton h-10 w-64 rounded" />
							<div className="skeleton h-24 w-full rounded" />
						</div>
					</div>
				</div>
			)
		return <NotFound what="artwork" />
	}

	const isOwner = currentUser?.id === art.artistId
	const related = artworks
		.filter(
			(a) =>
				a.id !== art.id &&
				(a.medium === art.medium || a.genre === art.genre),
		)
		.slice(0, 10)
	const published = new Date(art.createdAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})

	const menu: MenuItem[] = [
		{
			label: 'Copy link',
			icon: Link2,
			onClick: () => {
				navigator.clipboard?.writeText(window.location.href)
				toast('Link copied')
			},
		},
	]
	if (isOwner)
		menu.push({
			label: 'Delete',
			icon: Trash2,
			danger: true,
			onClick: () => setConfirming(true),
		})

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-6 sm:px-6">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-1 text-sm text-muted hover:text-ink"
			>
				<ChevronLeft size={16} /> Back to discover
			</button>

			<div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
				<button
					onClick={() => setExpanded(true)}
					className="group relative block overflow-hidden rounded-3xl bg-blush-deep"
				>
					<img
						src={art.image}
						alt={art.title}
						className="block max-h-[78vh] w-full object-cover"
					/>
					<span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-medium text-white">
						Click to expand
					</span>
				</button>

				<aside className="lg:pt-5">
					<div className="flex items-center justify-between">
						<p className="eyebrow">{art.medium}</p>
						<KebabMenu items={menu} />
					</div>

					<h1 className="headline mt-3 text-[2.4rem] leading-[1.05]">
						{art.title}
					</h1>

					<Link
						to={isOwner ? '/profile' : `/u/${artist.username}`}
						className="group mt-5 flex items-center gap-3 py-1"
					>
						<Avatar user={artist} size={34} />
						<span className="flex-1">
							<span className="block font-display text-[15px] font-bold">
								{artist.name}
							</span>
							<span className="block text-xs text-muted">View profile</span>
						</span>
						<ChevronRight size={16} className="text-muted" />
					</Link>

					{art.description && (
						<p className="mt-6 text-[14px] leading-[1.75] text-muted">
							{art.description}
						</p>
					)}

					{art.feedbackOn && (
						<div className="mt-6 rounded-2xl bg-lavender p-4">
							<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
								What I want feedback on
							</p>
							<p className="mt-2 text-[13px] leading-relaxed">
								{art.feedbackOn}
							</p>
						</div>
					)}

					{art.genre && (
						<div className="mt-5 flex flex-wrap gap-1.5">
							<TagChip>{art.genre}</TagChip>
						</div>
					)}

					<p className="mt-4 text-xs text-muted">Published {published}</p>

					{isOwner && (
						<div className="mt-6 border-t border-blush-deep pt-6">
							<button
								onClick={() => setConfirming(true)}
								className="inline-flex items-center gap-2 rounded-xl border border-blush-deep bg-cream px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger hover:text-white"
							>
								<Trash2 size={15} /> Delete artwork
							</button>
						</div>
					)}
				</aside>
			</div>

			<Critiques artworkId={art.id} artworkOwnerId={art.artistId} />

			{related.length > 0 && (
				<section className="mt-20">
					<h2 className="mb-6 font-display text-2xl font-bold tracking-tight">
						More like this
					</h2>
					<MasonryGrid artworks={related} />
				</section>
			)}

			{expanded && (
				<Lightbox
					src={art.image}
					alt={art.title}
					onClose={() => setExpanded(false)}
				/>
			)}
			<ConfirmDialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title="Delete this artwork?"
				message="This will also remove all of its comments. This action cannot be undone."
				onConfirm={async () => {
					if (await deleteArtwork(art.id)) navigate('/profile')
				}}
			/>
		</div>
	)
}