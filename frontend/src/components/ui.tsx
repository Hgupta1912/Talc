import type { LucideIcon } from 'lucide-react'
import { Ellipsis, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import type { User } from '../types/canvas'

interface AvatarProps {
	user: Pick<User, 'name' | 'avatar'> | null | undefined
	size?: number
	className?: string
}

export function Avatar({ user, size = 40, className = '' }: AvatarProps) {
	const initials = (user?.name || '?')
		.split(' ')
		.map((p) => p[0])
		.slice(0, 2)
		.join('')
	return user?.avatar ? (
		<img
			src={user.avatar}
			alt={user.name}
			style={{ width: size, height: size }}
			className={`shrink-0 rounded-full object-cover ${className}`}
		/>
	) : (
		<div
			style={{ width: size, height: size, fontSize: size * 0.38 }}
			className={`grid shrink-0 place-items-center rounded-full bg-coral font-semibold text-white ${className}`}
		>
			{initials}
		</div>
	)
}

interface TagChipProps {
	children: ReactNode
	active?: boolean
	onClick?: () => void
	size?: 'sm' | 'lg'
}

export function TagChip({
	children,
	active = false,
	onClick,
	size = 'sm',
}: TagChipProps) {
	const base =
		size === 'lg' ? 'px-3.5 py-1.5 text-[13px]' : 'px-2.5 py-1 text-[11px]'
	if (!onClick)
		return (
			<span
				className={`inline-block rounded-full bg-cream/80 text-muted ${base}`}
			>
				{children}
			</span>
		)
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full border transition ${base} ${
				active
					? 'border-accent bg-accent text-white'
					: 'border-blush-deep bg-cream/70 text-ink hover:border-ink/30 hover:bg-cream'
			}`}
		>
			{children}
		</button>
	)
}

export interface MenuItem {
	label: string
	icon?: LucideIcon
	onClick: () => void
	danger?: boolean
}

interface KebabMenuProps {
	items: MenuItem[]
	className?: string
	buttonClass?: string
}

export function KebabMenu({
	items,
	className = '',
	buttonClass = '',
}: KebabMenuProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const close = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', close)
		return () => document.removeEventListener('mousedown', close)
	}, [open])

	return (
		<div ref={ref} className={className || 'relative'}>
			<button
				type="button"
				aria-label="More options"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					setOpen((o) => !o)
				}}
				className={`grid h-8 w-8 place-items-center rounded-full transition hover:bg-cream ${buttonClass}`}
			>
				<Ellipsis size={18} strokeWidth={2.5} />
			</button>
			{open && (
				<div className="animate-rise absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-xl border border-blush-deep bg-cream py-1 shadow-xl">
					{items.map(({ label, icon: Icon, onClick, danger }) => (
						<button
							key={label}
							type="button"
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								setOpen(false)
								onClick()
							}}
							className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition hover:bg-blush/50 ${danger ? 'text-danger' : 'text-ink'}`}
						>
							{Icon && <Icon size={15} />}
							{label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

interface ModalProps {
	open: boolean
	onClose: () => void
	children: ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	if (!open) return null
	return (
		<div className="fixed inset-0 z-50 grid place-items-center p-4">
			<div
				className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="animate-rise relative w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl">
				{children}
			</div>
		</div>
	)
}

interface ConfirmDialogProps {
	open: boolean
	title: string
	message: string
	confirmLabel?: string
	onConfirm: () => void
	onClose: () => void
}

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = 'Delete',
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	return (
		<Modal open={open} onClose={onClose}>
			<div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-danger-soft text-danger">
				<Trash2 size={18} />
			</div>
			<h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
			<p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
			<div className="mt-6 flex justify-end gap-2">
				<button className="btn-secondary" onClick={onClose}>
					Cancel
				</button>
				<button
					className="btn-danger"
					onClick={() => {
						onConfirm()
						onClose()
					}}
				>
					{confirmLabel}
				</button>
			</div>
		</Modal>
	)
}

export function Toaster() {
	const { toasts } = useApp()
	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4">
			{toasts.map((t) => (
				<div
					key={t.id}
					className="animate-rise rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl"
				>
					{t.message}
				</div>
			))}
		</div>
	)
}

interface EmptyStateProps {
	title: string
	body?: string
	action?: ReactNode
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center rounded-3xl border border-dashed border-blush-deep bg-cream/40 px-6 py-16 text-center">
			<h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
			{body && <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>}
			{action && <div className="mt-5">{action}</div>}
		</div>
	)
}
