import { ChevronDown, Heart, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CRITIQUE_TAGS } from '../data/mock'
import { useApp } from '../store/AppContext'
import type { Comment, CommentInput } from '../types/canvas'
import { timeAgo } from '../utils/time'
import { Avatar, ConfirmDialog, EmptyState, KebabMenu, TagChip } from './ui'

const MAX = 1000
type SortMode = 'helpful' | 'newest'

interface CommentFormProps {
	initial?: CommentInput
	submitLabel: string
	onSubmit: (input: CommentInput) => void
	onCancel?: () => void
	compact?: boolean
}

function CommentForm({
	initial = { body: '', tags: [] },
	submitLabel,
	onSubmit,
	onCancel,
	compact = false,
}: CommentFormProps) {
	const [body, setBody] = useState(initial.body)
	const [tags, setTags] = useState<string[]>(initial.tags)
	const toggle = (t: string) =>
		setTags((cur) =>
			cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
		)
	const canSubmit = body.trim().length > 0

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				if (!canSubmit) return
				onSubmit({ body: body.trim(), tags })
				if (!onCancel) {
					setBody('')
					setTags([])
				}
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
			<div className="mt-3 flex flex-wrap gap-1.5">
				{CRITIQUE_TAGS.map((t) => (
					<TagChip key={t} active={tags.includes(t)} onClick={() => toggle(t)}>
						{t}
					</TagChip>
				))}
			</div>
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
					{submitLabel}
				</button>
			</div>
		</form>
	)
}

function CommentCard({ comment }: { comment: Comment }) {
	const {
		users,
		currentUser,
		editComment,
		deleteComment,
		toggleHelpful,
		helpfulVotes,
	} = useApp()
	const [editing, setEditing] = useState(false)
	const [confirming, setConfirming] = useState(false)
	const author = users[comment.authorId]
	const isMine = currentUser?.id === comment.authorId
	const voted = helpfulVotes.has(comment.id)
	if (!author) return null

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
								{comment.edited && ' · edited'}
							</span>
						</p>
						{isMine && !editing && (
							<KebabMenu
								items={[
									{
										label: 'Edit',
										icon: Pencil,
										onClick: () => setEditing(true),
									},
									{
										label: 'Delete',
										icon: Trash2,
										danger: true,
										onClick: () => setConfirming(true),
									},
								]}
							/>
						)}
					</div>

					{editing ? (
						<div className="mt-3 rounded-2xl bg-cream p-4">
							<CommentForm
								compact
								initial={{ body: comment.body, tags: comment.tags }}
								submitLabel="Save"
								onCancel={() => setEditing(false)}
								onSubmit={(input) => {
									editComment(comment.id, input)
									setEditing(false)
								}}
							/>
						</div>
					) : (
						<>
							{comment.tags.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-1.5">
									{comment.tags.map((t) => (
										<TagChip key={t}>{t}</TagChip>
									))}
								</div>
							)}
							<p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">
								{comment.body}
							</p>
							<button
								onClick={() => toggleHelpful(comment.id)}
								disabled={!currentUser || isMine}
								className={`mt-3 inline-flex items-center gap-1.5 text-xs transition ${voted ? 'text-coral' : 'text-muted hover:text-ink'} disabled:cursor-default`}
							>
								<Heart size={14} fill={voted ? 'currentColor' : 'none'} />
								Helpful <span className="text-faint">{comment.helpful}</span>
							</button>
						</>
					)}
				</div>
			</div>
			<ConfirmDialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title="Delete this comment?"
				message="Your critique will be permanently removed."
				onConfirm={() => deleteComment(comment.id)}
			/>
		</li>
	)
}

export default function Critiques({ artworkId }: { artworkId: string }) {
	const { comments, currentUser, addComment } = useApp()
	const [sort, setSort] = useState<SortMode>('helpful')

	const list = useMemo(() => {
		const forArt = comments.filter((c) => c.artworkId === artworkId)
		return [...forArt].sort((a, b) =>
			sort === 'helpful'
				? b.helpful - a.helpful
				: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
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
							<option value="helpful">Most helpful</option>
							<option value="newest">Newest</option>
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
								onSubmit={(input) => addComment(artworkId, input)}
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
						<CommentCard key={c.id} comment={c} />
					))}
				</ul>
			)}
		</section>
	)
}
