import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useApp } from '../store/AppContext'
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
		name: '',
		email: '',
		password: '',
	})
	const set = (k: keyof SignupInput) => (e: ChangeEvent<HTMLInputElement>) =>
		setForm((f) => ({ ...f, [k]: e.target.value }))
	const valid =
		form.email !== '' &&
		form.password.length >= 6 &&
		(!isSignup || form.name !== '')

	const submit = (e: FormEvent) => {
		e.preventDefault()
		if (isSignup)
			signup(form) // TODO: real auth
		else login()
		navigate('/')
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
						<input
							className="field"
							placeholder="Your name"
							value={form.name}
							onChange={set('name')}
						/>
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
						placeholder="Password"
						value={form.password}
						onChange={set('password')}
					/>
					<button
						type="submit"
						disabled={!valid}
						className="btn-primary w-full !py-3"
					>
						{isSignup ? 'Create account' : 'Log in'}
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
