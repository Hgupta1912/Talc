import { Link } from 'react-router-dom'

export default function NotFound({ what = 'page' }: { what?: string }) {
	return (
		<div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-28 text-center">
			<p className="eyebrow">404</p>
			<h1 className="headline mt-3 text-[2.5rem] leading-tight">
				This {what} has left the gallery.
			</h1>
			<p className="mt-3 text-[15px] text-muted">
				It may have been deleted, or the link is wrong.
			</p>
			<Link to="/" className="btn-primary mt-8">
				Back to discover
			</Link>
		</div>
	)
}
