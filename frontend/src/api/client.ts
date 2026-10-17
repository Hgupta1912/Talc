const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
	status: number
	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
	token?: string | null
	body?: unknown
}

export async function api<T>(
	path: string,
	{ method = 'GET', token, body }: RequestOptions = {},
): Promise<T> {
	const isForm = body instanceof FormData
	const headers: Record<string, string> = {}
	if (token) headers.Authorization = `Bearer ${token}`
	if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

	let response: Response
	try {
		response = await fetch(`${API_BASE}${path}`, {
			method,
			headers,
			body:
				body === undefined
					? undefined
					: isForm
						? (body as FormData)
						: JSON.stringify(body),
		})
	} catch {
		throw new ApiError('Could not reach the server. Is the backend running?', 0)
	}

	if (!response.ok) {
		const info = (await response.json().catch(() => ({}))) as {
			error?: string
			message?: string
		}
		throw new ApiError(
			info.error || info.message || `Request failed (${response.status})`,
			response.status,
		)
	}

	return (response.status === 204 ? null : await response.json()) as T
}