import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useApp } from '../store/useApp'
import type { SignupInput } from '../types/canvas'

export default function Login({
	mode = 'login',
}: {
	mode?: 'login' | 'signup'
}) {
	const isSignup = mode === 'signup'
	const { login, signup } = useApp()
	const navigate = useNavigate()
	const [form, setForm] = useState<SignupInput>({
		username: '',
		email: '',
		password: '',
	})
	const [submitting, setSubmitting] = useState(false)
	const set = (k: keyof SignupInput) => (e: ChangeEvent<HTMLInputElement>) =>
		setForm((f) => ({ ...f, [k]: e.target.value }))
	const usernameOk = /^[a-zA-Z0-9_]{3,30}$/.test(form.username) && form.username !== 'me'
	const valid =
		form.email !== '' &&
		form.password.length >= 6 &&
		(!isSignup || usernameOk) &&
		!submitting

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		if (!valid) return
		setSubmitting(true)
		const ok = isSignup
			? await signup(form)
			: await login({ email: form.email, password: form.password })
		setSubmitting(false)
		if (ok) navigate('/')
	}

	return (
		<div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
			<Logo />
			<div className="m-auto w-full max-w-[380px] py-12">
				<h1 className="headline text-[2.25rem] leading-tight">
					{isSignup ? 'Join Talc' : 'Welcome back'}
				</h1>
				<p className="mt-2 text-sm text-muted">
					{isSignup
						? 'Share your work or help artists see it differently.'
						: 'Log in to keep the conversation going.'}
				</p>

				<form onSubmit={submit} className="mt-8 space-y-4">
					{isSignup && (
						<div>
							<input
								className="field"
								placeholder="Username"
								autoComplete="username"
								value={form.username}
								onChange={set('username')}
							/>
							{form.username !== '' && !usernameOk && (
								<p className="mt-1.5 text-xs text-danger">
									3–30 letters, numbers or underscores.
								</p>
							)}
						</div>
					)}
					<input
						className="field"
						type="email"
						placeholder="Email"
						value={form.email}
						onChange={set('email')}
					/>
					<input
						className="field"
						type="password"
						autoComplete={isSignup ? 'new-password' : 'current-password'}
						placeholder="Password"
						value={form.password}
						onChange={set('password')}
					/>
					<button
						type="submit"
						disabled={!valid}
						className="btn-primary w-full !py-3"
					>
						{submitting
							? isSignup
								? 'Creating account…'
								: 'Logging in…'
							: isSignup
								? 'Create account'
								: 'Log in'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					{isSignup ? 'Already have an account? ' : 'New to Talc? '}
					<Link
						to={isSignup ? '/login' : '/signup'}
						className="font-semibold text-accent hover:underline"
					>
						{isSignup ? 'Log in' : 'Sign up'}
					</Link>
				</p>
			</div>
		</div>
	)
}