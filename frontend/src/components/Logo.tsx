import { Link } from 'react-router-dom'

export default function Logo() {
	return (
		<Link to="/" className="flex shrink-0 items-center gap-2.5">
			<svg width="20" height="22" viewBox="0 0 20 22" aria-hidden>
				<path
					d="M10 0.8c4.6 0 9.2 3.4 9.2 9.6 0 6.6-4.4 10.8-9.6 10.8C4.3 21.2.8 17 .8 11.3.8 4.9 5.2.8 10 .8Z"
					fill="#ff6b4f"
					transform="rotate(-12 10 11)"
				/>
			</svg>
			<span className="font-display text-[19px] font-bold tracking-tight">
				Talc
			</span>
		</Link>
	)
}
