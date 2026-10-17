import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import type { Comment } from '../types/canvas'
import { timeAgo } from '../utils/time'
import type { MenuItem } from './ui'
import { Avatar, ConfirmDialog, EmptyState, KebabMenu } from './ui'

const MAX = 2000
type SortMode = 'oldest' | 'newest'

interface CommentFormProps {
	initial?: string
	submitLabel: string
	onSubmit: (body: string) => Promise<boolean>
	onCancel?: () => void
	compact?: boolean
}

function CommentForm({
	initial = '',
	submitLabel,
	onSubmit,
	onCancel,
	compact = false,
}: CommentFormProps) {
	const [body, setBody] = useState(initial)
	const [saving, setSaving] = useState(false)
	const canSubmit = body.trim().length > 0 && !saving

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault()
				if (!canSubmit) return
				setSaving(true)
				const ok = await onSubmit(body.trim())
				setSaving(false)
				if (ok && !onCancel) setBody('')
			}}
		>
			<textarea
				value={body}
				onChange={(e) => setBody(e.target.value.slice(0, MAX))}
				placeholder="Offer a thoughtful critique…"
				rows={compact ? 3 : 4}
				autoFocus={!!onCancel}
				className="w-full resize-y border-b border-blush-deep bg-transparent pb-3 text-sm leading-relaxed outline-none placeholder:text-faint"
			/>
			<div className="mt-4 flex items-center justify-end gap-3">
				<span className="text-xs text-faint">
					{body.length}/{MAX}
				</span>
				{onCancel && (
					<button type="button" className="btn-ghost" onClick={onCancel}>
						Cancel
					</button>
				)}
				<button type="submit" disabled={!canSubmit} className="btn-primary">
					{saving ? 'Saving…' : submitLabel}
				</button>
			</div>
		</form>
	)
}

function CommentCard({
	comment,
	artworkOwnerId,
}: {
	comment: Comment
	artworkOwnerId: string
}) {
	const { users, currentUser, editComment, deleteComment } = useApp()
	const [editing, setEditing] = useState(false)
	const [confirming, setConfirming] = useState(false)
	const author = users[comment.authorId]
	const isMine = currentUser?.id === comment.authorId
	const ownsArtwork = currentUser?.id === artworkOwnerId
	if (!author) return null

	const menu: MenuItem[] = []
	if (isMine)
		menu.push({ label: 'Edit', icon: Pencil, onClick: () => setEditing(true) })
	if (isMine || ownsArtwork)
		menu.push({
			label: 'Delete',
			icon: Trash2,
			danger: true,
			onClick: () => setConfirming(true),
		})

	return (
		<li className="border-b border-blush-deep py-6 first:pt-2 last:border-0">
			<div className="flex gap-3.5">
				<Link to={`/u/${author.username}`}>
					<Avatar user={author} size={34} />
				</Link>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<p className="flex flex-wrap items-baseline gap-x-2">
							<Link
								to={`/u/${author.username}`}
								className="font-display text-[15px] font-bold hover:underline"
							>
								{author.name}
							</Link>
							<span className="text-xs text-muted">
								{timeAgo(comment.createdAt)}
							</span>
						</p>
						{menu.length > 0 && !editing && <KebabMenu items={menu} />}
					</div>

					{editing ? (
						<div className="mt-3 rounded-2xl bg-cream p-4">
							<CommentForm
								compact
								initial={comment.body}
								submitLabel="Save"
								onCancel={() => setEditing(false)}
								onSubmit={async (body) => {
									const ok = await editComment(comment, body)
									if (ok) setEditing(false)
									return ok
								}}
							/>
						</div>
					) : (
						<p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">
							{comment.body}
						</p>
					)}
				</div>
			</div>
			<ConfirmDialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title="Delete this comment?"
				message={
					isMine
						? 'Your critique will be permanently removed.'
						: 'This critique will be permanently removed from your artwork.'
				}
				onConfirm={() => deleteComment(comment)}
			/>
		</li>
	)
}

export default function Critiques({
	artworkId,
	artworkOwnerId,
}: {
	artworkId: string
	artworkOwnerId: string
}) {
	const { comments, currentUser, addComment } = useApp()
	const [sort, setSort] = useState<SortMode>('oldest')

	const list = useMemo(() => {
		const forArt = comments.filter((c) => c.artworkId === artworkId)
		return [...forArt].sort((a, b) => {
			const diff =
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			return sort === 'oldest' ? diff : -diff
		})
	}, [comments, artworkId, sort])

	return (
		<section className="mt-16 max-w-[760px]">
			<div className="flex items-end justify-between gap-4">
				<div>
					<p className="eyebrow">Conversation</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
						Critiques{' '}
						<span className="text-lg font-semibold text-faint">
							{list.length}
						</span>
					</h2>
				</div>
				<label className="text-xs text-muted">
					<span className="mb-1 block">Sort by</span>
					<span className="relative block">
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortMode)}
							className="appearance-none rounded-lg bg-transparent py-1.5 pl-2 pr-8 text-sm font-semibold text-ink outline-none hover:bg-cream/60"
						>
							<option value="oldest">Oldest first</option>
							<option value="newest">Newest first</option>
						</select>
						<ChevronDown
							size={16}
							className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink"
						/>
					</span>
				</label>
			</div>

			<div className="mt-6 rounded-3xl border border-blush-deep bg-cream p-5">
				{currentUser ? (
					<div className="flex gap-3">
						<Avatar user={currentUser} size={34} />
						<div className="flex-1">
							<CommentForm
								submitLabel="Post critique"
								onSubmit={(body) => addComment(artworkId, body)}
							/>
						</div>
					</div>
				) : (
					<p className="text-sm text-muted">
						<Link
							to="/login"
							className="font-semibold text-accent hover:underline"
						>
							Log in
						</Link>{' '}
						to leave a critique.
					</p>
				)}
			</div>

			{list.length === 0 ? (
				<div className="mt-8">
					<EmptyState
						title="No critiques yet"
						body="Be the first to give feedback on this piece."
					/>
				</div>
			) : (
				<ul className="mt-8">
					{list.map((c) => (
						<CommentCard
							key={c.id}
							comment={c}
							artworkOwnerId={artworkOwnerId}
						/>
					))}
				</ul>
			)}
		</section>
	)
}