import { useEffect, useMemo, useState } from 'react'
import { MasonryGrid, MasonrySkeleton } from '../components/ArtworkGrid'
import { EmptyState, TagChip } from '../components/ui'
import { MEDIUMS } from '../data/mock'
import { useApp } from '../store/AppContext'

const FILTERS = ['For You', 'Recent', 'Most Discussed', ...MEDIUMS]

export default function Discover() {
	const { artworks, comments } = useApp()
	const [filter, setFilter] = useState('For You')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const t = setTimeout(() => setLoading(false), 500) // fake loading delay
		return () => clearTimeout(t)
	}, [])

	const visible = useMemo(() => {
		const count = (id: string) =>
			comments.filter((c) => c.artworkId === id).length
		if (filter === 'Recent')
			return [...artworks].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)
		if (filter === 'Most Discussed')
			return [...artworks].sort((a, b) => count(b.id) - count(a.id))
		if (MEDIUMS.includes(filter))
			return artworks.filter((a) => a.medium === filter)
		return artworks // "For You": the recommendation algorithm goes here
	}, [artworks, comments, filter])

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-20 pt-6 sm:px-6">
			<div>
				<p className="eyebrow">Discover</p>
				<h1 className="headline mt-3 text-[clamp(2.25rem,5vw,3rem)] leading-[1.05]">
					Art worth talking about.
				</h1>
				<p className="mt-3 text-[15px] text-muted">
					Explore new work and help artists see it differently.
				</p>
			</div>
			<div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
				{FILTERS.map((f) => (
					<span key={f} className="shrink-0">
						<TagChip
							size="lg"
							active={filter === f}
							onClick={() => setFilter(f)}
						>
							{f}
						</TagChip>
					</span>
				))}
			</div>

			<div className="mt-6">
				{loading ? (
					<MasonrySkeleton />
				) : visible.length ? (
					<MasonryGrid artworks={visible} />
				) : (
					<EmptyState
						title={`No ${filter.toLowerCase()} work yet`}
						body="Check back soon, or try another filter."
					/>
				)}
			</div>
		</div>
	)
}
