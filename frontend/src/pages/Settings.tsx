import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Avatar } from '../components/ui'
import { useApp } from '../store/useApp'

export default function Settings() {
	const { currentUser, authLoading, updateUsername } = useApp()
	const [username, setUsername] = useState(currentUser?.username ?? '')
	const [saving, setSaving] = useState(false)

	if (!currentUser) return authLoading ? null : <Navigate to="/login" replace />

	const cleaned = username.trim()
	const changed = cleaned !== currentUser.username
	const valid = /^[a-zA-Z0-9_]{3,30}$/.test(cleaned) && cleaned !== 'me'

	const save = async (e: FormEvent) => {
		e.preventDefault()
		if (!changed || !valid) return
		setSaving(true)
		await updateUsername(cleaned)
		setSaving(false)
	}

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6">
			<p className="eyebrow">Account</p>
			<h1 className="headline mt-3 text-[clamp(2.25rem,5vw,3rem)] leading-[1.05]">
				Settings
			</h1>

			<form onSubmit={save} className="mt-8 max-w-[550px]">
				<h2 className="font-display text-[17px] font-bold">Edit profile</h2>
				<p className="mb-6 mt-1 text-xs text-muted">
					Your avatar is generated from your username.
				</p>

				<div className="flex items-center gap-4 border-b border-blush-deep pb-5">
					<Avatar user={currentUser} size={60} />
					<div>
						<p className="text-sm font-semibold">{currentUser.username}</p>
						{currentUser.email && (
							<p className="text-xs text-muted">{currentUser.email}</p>
						)}
					</div>
				</div>

				<div className="space-y-5 border-b border-blush-deep py-6">
					<label className="block">
						<span className="mb-2 block text-[12px] font-semibold">
							Username
						</span>
						<span className="flex items-center rounded-xl border border-blush-deep bg-cream focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
							<span className="pl-3.5 pr-4 text-xs text-muted">curve.art/</span>
							<input
								className="w-full bg-transparent py-2.5 pr-3.5 text-sm outline-none"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</span>
						{changed && !valid && (
							<span className="mt-1.5 block text-xs text-danger">
								3–30 letters, numbers or underscores.
							</span>
						)}
					</label>
					{currentUser.email && (
						<label className="block">
							<span className="mb-2 block text-[12px] font-semibold">
								Email
							</span>
							<input
								className="field cursor-not-allowed opacity-70"
								value={currentUser.email}
								readOnly
							/>
						</label>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-5">
					<button
						type="button"
						className="btn-ghost"
						disabled={!changed}
						onClick={() => setUsername(currentUser.username)}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="btn-primary"
						disabled={!changed || !valid || saving}
					>
						{saving ? 'Saving…' : 'Save changes'}
					</button>
				</div>
			</form>
		</div>
	)
}