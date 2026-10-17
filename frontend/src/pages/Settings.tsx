import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Avatar, ConfirmDialog } from '../components/ui'
import { useApp } from '../store/AppContext'

type Section = 'profile' | 'password' | 'notifications' | 'delete'

const SECTIONS: { id: Section; label: string; danger?: boolean }[] = [
	{ id: 'profile', label: 'Edit profile' },
	{ id: 'password', label: 'Password' },
	{ id: 'notifications', label: 'Notifications' },
	{ id: 'delete', label: 'Delete account', danger: true },
]

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="mb-2 block text-[12px] font-semibold">{label}</span>
			{children}
		</label>
	)
}

export default function Settings() {
	const { currentUser } = useApp()
	const [section, setSection] = useState<Section>('profile')
	if (!currentUser) return <Navigate to="/login" replace />

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6">
			<p className="eyebrow">Account</p>
			<h1 className="headline mt-3 text-[clamp(2.25rem,5vw,3rem)] leading-[1.05]">
				Settings
			</h1>
			<div className="mt-8 grid gap-8 md:grid-cols-[176px_1fr] md:gap-16">
				<nav className="flex gap-1 overflow-x-auto md:flex-col">
					{SECTIONS.map((s) => (
						<button
							key={s.id}
							onClick={() => setSection(s.id)}
							className={`shrink-0 rounded-lg px-3 py-2 text-left text-[13px] ${
								section === s.id
									? 'bg-accent font-semibold text-white'
									: s.danger
										? 'text-danger hover:bg-cream/60'
										: 'hover:bg-cream/60'
							}`}
						>
							{s.label}
						</button>
					))}
				</nav>
				<div className="max-w-[550px]">
					{section === 'profile' && <ProfileForm />}
					{section === 'password' && <PasswordForm />}
					{section === 'notifications' && <NotificationsForm />}
					{section === 'delete' && <DeleteAccount />}
				</div>
			</div>
		</div>
	)
}

interface ProfileFields {
	name: string
	username: string
	bio: string
	website: string
	location: string
}

function ProfileForm() {
	const { currentUser, updateProfile } = useApp()
	const initial: ProfileFields = {
		name: currentUser?.name ?? '',
		username: currentUser?.username ?? '',
		bio: currentUser?.bio ?? '',
		website: currentUser?.website ?? '',
		location: currentUser?.location ?? '',
	}
	const [form, setForm] = useState<ProfileFields>(initial)
	const set =
		(k: keyof ProfileFields) =>
		(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			setForm((f) => ({ ...f, [k]: e.target.value }))

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				updateProfile(form)
			}}
		>
			<h2 className="font-display text-[17px] font-bold">Edit profile</h2>
			<p className="mb-6 mt-1 text-xs text-muted">
				Update how your profile appears to others.
			</p>
			<div className="flex items-center gap-4 border-b border-blush-deep pb-5">
				<Avatar user={currentUser} size={60} />
				<div>
					<button type="button" className="btn-secondary !py-2">
						Change photo
					</button>
					<p className="mt-1.5 text-[11px] text-muted">JPG or PNG, up to 5MB</p>
				</div>
			</div>
			<div className="space-y-5 border-b border-blush-deep py-6">
				<Field label="Display name">
					<input className="field" value={form.name} onChange={set('name')} />
				</Field>
				<Field label="Username">
					<span className="flex items-center rounded-xl border border-blush-deep bg-cream">
						<span className="pl-3.5 pr-4 text-xs text-muted">talc.art/</span>
						<input
							className="w-full bg-transparent py-2.5 pr-3.5 text-sm outline-none"
							value={form.username}
							onChange={set('username')}
						/>
					</span>
				</Field>
				<Field label="Bio">
					<textarea
						className="field min-h-[88px]"
						value={form.bio}
						onChange={set('bio')}
					/>
				</Field>
				<Field label="Location">
					<input
						className="field"
						value={form.location}
						onChange={set('location')}
					/>
				</Field>
				<Field label="Website">
					<input
						className="field"
						value={form.website}
						onChange={set('website')}
					/>
				</Field>
			</div>
			<div className="flex justify-end gap-3 pt-5">
				<button
					type="button"
					className="btn-ghost"
					onClick={() => setForm(initial)}
				>
					Cancel
				</button>
				<button type="submit" className="btn-primary">
					Save changes
				</button>
			</div>
		</form>
	)
}

function PasswordForm() {
	const { toast } = useApp()
	const empty = { current: '', next: '', confirm: '' }
	const [pw, setPw] = useState(empty)
	const set = (k: keyof typeof empty) => (e: ChangeEvent<HTMLInputElement>) =>
		setPw((p) => ({ ...p, [k]: e.target.value }))
	const valid =
		pw.current !== '' && pw.next.length >= 8 && pw.next === pw.confirm

	return (
		<form
			className="space-y-5"
			onSubmit={(e) => {
				e.preventDefault()
				toast('Password updated')
				setPw(empty)
			}}
		>
			<h2 className="font-display text-[17px] font-bold">Password</h2>
			<Field label="Current password">
				<input
					type="password"
					className="field"
					value={pw.current}
					onChange={set('current')}
				/>
			</Field>
			<Field label="New password">
				<input
					type="password"
					className="field"
					value={pw.next}
					onChange={set('next')}
				/>
			</Field>
			<Field label="Confirm new password">
				<input
					type="password"
					className="field"
					value={pw.confirm}
					onChange={set('confirm')}
				/>
			</Field>
			<div className="flex justify-end">
				<button type="submit" className="btn-primary" disabled={!valid}>
					Update password
				</button>
			</div>
		</form>
	)
}

function NotificationsForm() {
	const { toast } = useApp()
	const [prefs, setPrefs] = useState({
		critiques: true,
		replies: true,
		helpful: false,
	})
	const rows: [keyof typeof prefs, string][] = [
		['critiques', 'New critiques on my artwork'],
		['replies', 'Replies to my comments'],
		['helpful', 'When someone finds my critique helpful'],
	]
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				toast('Preferences saved')
			}}
		>
			<h2 className="mb-4 font-display text-[17px] font-bold">Notifications</h2>
			{rows.map(([k, label]) => (
				<label
					key={k}
					className="flex items-center justify-between border-b border-blush-deep py-4 text-[14px]"
				>
					{label}
					<input
						type="checkbox"
						checked={prefs[k]}
						onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))}
						className="h-4 w-4 accent-accent"
					/>
				</label>
			))}
			<div className="flex justify-end pt-5">
				<button type="submit" className="btn-primary">
					Save changes
				</button>
			</div>
		</form>
	)
}

function DeleteAccount() {
	const { logout } = useApp()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	return (
		<div>
			<h2 className="font-display text-[17px] font-bold">Delete account</h2>
			<p className="mb-6 mt-1 text-xs text-muted">
				This permanently removes your profile, artwork and critiques.
			</p>
			<button className="btn-danger" onClick={() => setOpen(true)}>
				Delete my account
			</button>
			<ConfirmDialog
				open={open}
				onClose={() => setOpen(false)}
				title="Delete your account?"
				message="All of your artwork and comments will be removed. This action cannot be undone."
				confirmLabel="Delete account"
				onConfirm={() => {
					logout()
					navigate('/login')
				}}
			/>
		</div>
	)
}
