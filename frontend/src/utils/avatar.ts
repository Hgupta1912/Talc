const STYLE = 'lorelei'
const BACKGROUNDS = 'ffb4a3,cfe3d6,dcd0f7,ffe1a8' // coral, sage, lavender, butter — picked per seed

export function avatarUrl(seed: string): string {
	return `https://api.dicebear.com/10.x/${STYLE}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${BACKGROUNDS}`
}