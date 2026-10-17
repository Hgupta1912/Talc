import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MasonryGrid } from '../components/ArtworkGrid'
import { Avatar, EmptyState } from '../components/ui'
import { useApp } from '../store/AppContext'
import { timeAgo } from '../utils/time'
import NotFound from './NotFound'

type Tab = 'art' | 'comments'

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<div>
			<dd className="font-display text-lg font-bold">{value}</dd>
			<dt className="text-[11px] text-muted">{label}</dt>
		</div>
	)
}

export default function Profile() {
	const { username } = useParams<{ username: string }>()
	const { users, currentUser, artworks, comments } = useApp()
	const [tab, setTab] = useState<Tab>('art')

	const user = username
		? Object.values(users).find((u) => u.username === username)
		: currentUser
	if (!user)
		return username ? (
			<NotFound what="artist" />
		) : (
			<Navigate to="/login" replace />
		)
	if (username && currentUser?.id === user.id)
		return <Navigate to="/profile" replace />

	const isMe = currentUser?.id === user.id
	const myArt = artworks.filter((a) => a.artistId === user.id)
	const myArtIds = new Set(myArt.map((a) => a.id))
	const received = comments.filter((c) => myArtIds.has(c.artworkId)).length
	const given = comments.filter(
		(c) => c.authorId === user.id && !myArtIds.has(c.artworkId),
	)

	const tabs: { id: Tab; label: string; count: number }[] = [
		{ id: 'art', label: isMe ? 'My artwork' : 'Artwork', count: myArt.length },
		{
			id: 'comments',
			label: isMe ? "Comments I've left" : 'Critiques',
			count: given.length,
		},
	]

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
			<div className="mx-auto flex max-w-[740px] flex-col gap-6 sm:flex-row sm:gap-8">
				<Avatar user={user} size={108} />
				<div className="flex-1">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="headline text-[2rem] leading-tight">
								{user.name}
							</h1>
							<p className="mt-1 text-xs text-muted">
								@{user.username}
								{user.location && ` · ${user.location}`}
							</p>
						</div>
						{isMe && (
							<Link to="/settings" className="btn-secondary shrink-0 !py-2">
								Edit profile
							</Link>
						)}
					</div>
					{user.bio && (
						<p className="mt-5 max-w-[480px] text-[14px] leading-[1.7] text-muted">
							{user.bio}
						</p>
					)}
					<div className="mt-3 flex flex-wrap gap-4 text-xs">
						{user.website && (
							<a
								href={user.website}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-accent hover:underline"
							>
								{user.website.replace(/^https?:\/\//, '')}{' '}
								<ExternalLink size={11} />
							</a>
						)}
						<span className="text-accent">@{user.username}</span>
					</div>
					<dl className="mt-6 flex gap-8">
						<Stat value={myArt.length} label="Artworks" />
						<Stat value={received} label="Critiques received" />
						<Stat value={given.length} label="Critiques given" />
					</dl>
				</div>
			</div>

			<div className="mt-12 flex gap-8 border-b border-blush-deep">
				{tabs.map((t) => (
					<button
						key={t.id}
						onClick={() => setTab(t.id)}
						className={`-mb-px border-b-2 pb-3 text-[14px] transition ${tab === t.id ? 'border-ink font-semibold' : 'border-transparent text-muted hover:text-ink'}`}
					>
						{t.label}{' '}
						<span className="ml-1 text-[10px] text-faint">{t.count}</span>
					</button>
				))}
			</div>

			<div className="mt-6">
				{tab === 'art' ? (
					myArt.length ? (
						<MasonryGrid artworks={myArt} manageable={isMe} />
					) : (
						<EmptyState
							title={isMe ? 'Upload your first piece' : 'No artwork yet'}
							action={
								isMe ? (
									<Link to="/upload" className="btn-primary">
										Upload artwork
									</Link>
								) : undefined
							}
						/>
					)
				) : given.length ? (
					<ul className="mx-auto max-w-[680px]">
						{given.map((c) => {
							const art = artworks.find((a) => a.id === c.artworkId)
							if (!art) return null
							return (
								<li key={c.id} className="border-b border-blush-deep">
									<Link
										to={`/art/${art.id}`}
										className="flex gap-4 py-6 hover:opacity-80"
									>
										<img
											src={art.image}
											alt=""
											className="h-[70px] w-[54px] shrink-0 rounded-lg object-cover"
										/>
										<div className="min-w-0">
											<p className="text-[11px] text-muted">
												On{' '}
												<b className="font-semibold text-ink/80">{art.title}</b>
											</p>
											<p className="mt-1.5 text-[13px] leading-relaxed">
												{c.body}
											</p>
											<p className="mt-2.5 text-[11px] text-muted">
												{timeAgo(c.createdAt)}
											</p>
										</div>
									</Link>
								</li>
							)
						})}
					</ul>
				) : (
					<EmptyState title="No critiques yet" />
				)}
			</div>
		</div>
	)
}
