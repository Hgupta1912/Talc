import { ChevronRight, LogOut, Plus, Settings, User as UserIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/useApp'
import Logo from './Logo'
import { Avatar } from './ui'

function UserMenu({ onClose }: { onClose: () => void }) {
	const { currentUser, logout } = useApp()
	const navigate = useNavigate()
	if (!currentUser) return null
	const item = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-blush/40'
	return (
		<div className="animate-rise absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-blush-deep bg-cream py-1.5 shadow-2xl">
			<div className="border-b border-blush-deep px-4 pb-2.5 pt-1.5">
				<p className="text-sm font-semibold">{currentUser.name}</p>
				<p className="text-xs text-muted">@{currentUser.username}</p>
			</div>
			<Link to="/profile" onClick={onClose} className={item}><UserIcon size={15} /> Profile</Link>
			<Link to="/settings" onClick={onClose} className={item}><Settings size={15} /> Settings</Link>
			<button onClick={() => { onClose(); logout(); navigate('/login') }} className={`${item} text-danger`}>
				<LogOut size={15} /> Log out
			</button>
		</div>
	)
}

export default function Navbar() {
	const { currentUser } = useApp()
	const [menuOpen, setMenuOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!menuOpen) return
		const h = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setMenuOpen(false)
		}
		document.addEventListener('mousedown', h)
		return () => document.removeEventListener('mousedown', h)
	}, [menuOpen])

	return (
		<header className="sticky top-0 z-30 border-b border-blush-deep bg-blush/90 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
				<Logo />

				{currentUser ? (
					<>
						<Link to="/upload" className="btn-primary ml-auto shrink-0 !px-3 sm:!px-4">
							<Plus size={16} strokeWidth={2.5} /><span className="hidden sm:inline">Upload</span>
						</Link>
						<div ref={ref} className="relative">
							<button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-1 rounded-full hover:opacity-80" aria-label="Account menu">
								<Avatar user={currentUser} size={34} />
								<ChevronRight size={14} className="hidden text-muted sm:block" />
							</button>
							{menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
						</div>
					</>
				) : (
					<Link to="/login" className="btn-primary ml-auto shrink-0">Log in</Link>
				)}
			</div>
		</header>
	)
}