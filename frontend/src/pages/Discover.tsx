import { useEffect, useMemo, useState } from 'react'
import { MasonryGrid, MasonrySkeleton } from '../components/ArtworkGrid'
import { EmptyState, TagChip } from '../components/ui'
import { MEDIUMS } from '../data/constants'
import { useApp } from '../store/useApp'

const FILTERS = ['For You', 'Recent', 'Most Discussed', ...MEDIUMS]

export default function Discover() {
	const { artworks, feedLoading, loadFeed } = useApp()
	const [filter, setFilter] = useState('For You')

	useEffect(() => {
		loadFeed()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const visible = useMemo(() => {
		if (filter === 'Recent')
			return [...artworks].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)
		if (filter === 'Most Discussed')
			return [...artworks].sort(
				(a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0),
			)
		if (MEDIUMS.includes(filter))
			return artworks.filter((a) => a.medium === filter)
		return artworks // "For You": the backend currently returns the newest 30
	}, [artworks, filter])

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
				{feedLoading && artworks.length === 0 ? (
					<MasonrySkeleton />
				) : visible.length ? (
					<MasonryGrid artworks={visible} />
				) : (
					<EmptyState
						title={
							artworks.length
								? `No ${filter.toLowerCase()} work yet`
								: 'Nothing here yet'
						}
						body={
							artworks.length
								? 'Try another filter.'
								: 'Be the first to share a piece.'
						}
					/>
				)}
			</div>
		</div>
	)
}