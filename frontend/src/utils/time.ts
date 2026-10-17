export function timeAgo(iso: string): string {
	const s = (Date.now() - new Date(iso).getTime()) / 1000
	if (s < 60) return 'just now'
	if (s < 3600) return `${Math.floor(s / 60)} minutes ago`
	if (s < 86400) {
		const hrs = Math.floor(s / 3600)
		return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
	}
	if (s < 172800) return 'Yesterday'
	if (s < 604800) return `${Math.floor(s / 86400)} days ago`
	return new Date(iso).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}
