import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MasonryGrid, MasonrySkeleton } from '../components/ArtworkGrid'
import { Avatar, EmptyState } from '../components/ui'
import type { Profile as ProfileData } from '../store/context'
import { useApp } from '../store/useApp'
import NotFound from './NotFound'

function Stat({ value, label }: { value: string | number; label: string }) {
	return (
		<div>
			<dd className="font-display text-lg font-bold">{value}</dd>
			<dt className="text-[11px] text-muted">{label}</dt>
		</div>
	)
}

/** Handles both /profile (your own) and /u/:username (someone else's, read-only). */
export default function Profile() {
	const { username } = useParams<{ username: string }>()
	const { currentUser, authLoading, artworks, loadProfile } = useApp()
	const isMeRoute = !username
	const viewingSelf =
		isMeRoute || (!!currentUser && currentUser.username === username)
	const key = isMeRoute ? `me:${currentUser?.id ?? ''}` : `u:${username}`

	// Which profile finished loading (null profile = not found).
	const [loaded, setLoaded] = useState<{
		key: string
		profile: ProfileData | null
	} | null>(null)
	const profile = loaded?.key === key ? loaded.profile : null
	const status =
		loaded?.key !== key ? 'loading' : profile ? 'ready' : 'missing'

	useEffect(() => {
		if (isMeRoute && !currentUser) return // wait for login / redirect
		let cancelled = false
		loadProfile(isMeRoute ? 'me' : username!).then((p) => {
			if (!cancelled) setLoaded({ key, profile: p })
		})
		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key])

	if (isMeRoute && !currentUser)
		return authLoading ? null : <Navigate to="/login" replace />
	if (username && currentUser?.username === username)
		return <Navigate to="/profile" replace />
	if (status === 'missing') return <NotFound what="artist" />

	const user = viewingSelf && currentUser ? currentUser : profile?.user
	// Read from the shared list so deletes show up immediately.
	const ids = new Set(profile?.artworks.map((a) => a.id))
	const theirArt = artworks.filter((a) => ids.has(a.id))
	const joined = user?.createdAt
		? new Date(user.createdAt).toLocaleDateString('en-US', {
				month: 'short',
				year: 'numeric',
			})
		: '—'

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
			<div className="mx-auto flex max-w-[740px] flex-col gap-6 sm:flex-row sm:gap-8">
				{user ? (
					<Avatar user={user} size={108} />
				) : (
					<div className="skeleton h-[108px] w-[108px] rounded-full" />
				)}
				<div className="flex-1">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="headline text-[2rem] leading-tight">
								{user?.name ?? '\u00a0'}
							</h1>
							{user && (
								<p className="mt-1 text-xs text-muted">@{user.username}</p>
							)}
						</div>
						{viewingSelf && (
							<Link to="/settings" className="btn-secondary shrink-0 !py-2">
								Edit profile
							</Link>
						)}
					</div>
					<dl className="mt-6 flex gap-8">
						<Stat
							value={status === 'ready' ? theirArt.length : '—'}
							label="Artworks"
						/>
						<Stat value={joined} label="Joined" />
					</dl>
				</div>
			</div>

			<div className="mt-12 border-b border-blush-deep">
				<p className="-mb-px inline-block border-b-2 border-ink pb-3 text-[14px] font-semibold">
					{viewingSelf ? 'My artwork' : 'Artwork'}{' '}
					<span className="ml-1 text-[10px] text-faint">
						{status === 'ready' ? theirArt.length : ''}
					</span>
				</p>
			</div>

			<div className="mt-6">
				{status === 'loading' ? (
					<MasonrySkeleton count={5} />
				) : theirArt.length ? (
					<MasonryGrid artworks={theirArt} manageable={viewingSelf} />
				) : (
					<EmptyState
						title={viewingSelf ? 'Upload your first piece' : 'No artwork yet'}
						action={
							viewingSelf ? (
								<Link to="/upload" className="btn-primary">
									Upload artwork
								</Link>
							) : undefined
						}
					/>
				)}
			</div>
		</div>
	)
}