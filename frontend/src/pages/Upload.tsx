import { ChevronDown, ChevronLeft, Upload as UploadIcon, X } from 'lucide-react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MEDIUMS } from '../data/mock'
import { useApp } from '../store/AppContext'

const MAX_MB = 20
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']

interface UploadForm {
	title: string
	description: string
	medium: string
	tags: string
	feedbackOn: string
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block">
			<span className="mb-2 block text-[13px] font-semibold">{label}</span>
			{children}
		</label>
	)
}

export default function Upload() {
	const navigate = useNavigate()
	const { createArtwork, toast } = useApp()
	const inputRef = useRef<HTMLInputElement>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [dragging, setDragging] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState<UploadForm>({
		title: '',
		description: '',
		medium: '',
		tags: '',
		feedbackOn: '',
	})

	const set =
		(k: keyof UploadForm) =>
		(
			e: ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) =>
			setForm((f) => ({ ...f, [k]: e.target.value }))

	const pickFile = (file: File | undefined) => {
		setError('')
		if (!file) return
		if (!ACCEPT.includes(file.type))
			return setError('Please choose a JPG, PNG or WEBP file.')
		if (file.size > MAX_MB * 1024 * 1024)
			return setError(`That file is over ${MAX_MB}MB.`)
		setPreview(URL.createObjectURL(file)) // TODO: upload to real storage and keep the returned URL
	}

	const canPublish = Boolean(preview && form.title.trim() && form.medium)

	const publish = (e: FormEvent) => {
		e.preventDefault()
		if (!canPublish || !preview) return
		const art = createArtwork({
			title: form.title.trim(),
			description: form.description.trim(),
			medium: form.medium,
			feedbackOn: form.feedbackOn.trim(),
			tags: form.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
			image: preview,
		})
		navigate(`/art/${art.id}`)
	}

	return (
		<div className="mx-auto max-w-[1120px] px-4 pb-24 pt-6 sm:px-6">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-1 text-sm text-muted hover:text-ink"
			>
				<ChevronLeft size={16} /> Back
			</button>

			<p className="eyebrow mt-10">Share your work</p>
			<h1 className="headline mt-3 text-[clamp(2.25rem,5vw,3rem)] leading-[1.05]">
				Upload artwork
			</h1>
			<p className="mt-3 text-[15px] text-muted">
				Invite focused feedback from a community that cares about the process.
			</p>

			<form
				onSubmit={publish}
				className="mt-10 grid gap-10 lg:grid-cols-[480px_1fr] lg:gap-14"
			>
				<div>
					<div
						role="button"
						tabIndex={0}
						onClick={() => {
							if (!preview) inputRef.current?.click()
						}}
						onDragOver={(e) => {
							e.preventDefault()
							setDragging(true)
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={(e) => {
							e.preventDefault()
							setDragging(false)
							pickFile(e.dataTransfer.files?.[0])
						}}
						className={`relative grid aspect-[480/534] place-items-center overflow-hidden rounded-3xl border border-dashed transition ${
							dragging
								? 'border-accent bg-lavender/40'
								: 'border-ink/25 bg-cream/40 hover:bg-cream/70'
						} ${preview ? '' : 'cursor-pointer'}`}
					>
						{preview ? (
							<>
								<img
									src={preview}
									alt="Preview"
									className="h-full w-full object-contain"
								/>
								<button
									type="button"
									onClick={() => setPreview(null)}
									className="absolute right-3 top-3 rounded-full bg-cream p-2 shadow"
									aria-label="Remove image"
								>
									<X size={16} />
								</button>
							</>
						) : (
							<div className="flex flex-col items-center px-6 text-center">
								<span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-accent shadow-sm">
									<UploadIcon size={18} />
								</span>
								<p className="mt-4 font-display text-[15px] font-bold">
									Drop your artwork here
								</p>
								<p className="mt-1 text-xs text-muted">or click to browse</p>
								<p className="mt-4 text-[11px] text-faint">
									JPG, PNG or WEBP · Max {MAX_MB}MB
								</p>
							</div>
						)}
					</div>
					{error && <p className="mt-2 text-sm text-danger">{error}</p>}
					<input
						ref={inputRef}
						type="file"
						accept={ACCEPT.join(',')}
						className="hidden"
						onChange={(e) => pickFile(e.target.files?.[0])}
					/>
				</div>

				<div className="space-y-6">
					<Field label="Title">
						<input
							className="field"
							placeholder="Give your artwork a name"
							value={form.title}
							onChange={set('title')}
						/>
					</Field>
					<Field label="Description">
						<textarea
							className="field min-h-[88px] resize-y"
							placeholder="Tell us about the idea, process, or story behind this piece"
							value={form.description}
							onChange={set('description')}
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Medium">
							<span className="relative block">
								<select
									className="field appearance-none pr-9"
									value={form.medium}
									onChange={set('medium')}
								>
									<option value="">Select medium</option>
									{MEDIUMS.map((m) => (
										<option key={m}>{m}</option>
									))}
								</select>
								<ChevronDown
									size={16}
									className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
								/>
							</span>
						</Field>
						<Field label="Tags">
							<input
								className="field"
								placeholder="Abstract, portrait, nature…"
								value={form.tags}
								onChange={set('tags')}
							/>
						</Field>
					</div>
					<Field label="What do you want feedback on?">
						<textarea
							className="field min-h-[88px] resize-y"
							placeholder="Help others give you useful, specific feedback"
							value={form.feedbackOn}
							onChange={set('feedbackOn')}
						/>
					</Field>
					<div className="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							className="btn-ghost"
							onClick={() => toast('Draft saved')}
						>
							Save draft
						</button>
						<button
							type="submit"
							disabled={!canPublish}
							className="btn-primary"
						>
							Publish artwork
						</button>
					</div>
				</div>
			</form>
		</div>
	)
}
