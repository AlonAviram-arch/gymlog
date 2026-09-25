import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { MEDIA_CREDIT, gifUrl, thumbUrl } from '../data/media'

/** 180×180 demo GIF with the required attribution. */
export function DemoGif({ media, name }) {
  const [failed, setFailed] = useState(false)
  if (!media) return null
  return (
    <figure className="mx-auto w-[180px]">
      <div className="grid h-[180px] w-[180px] place-items-center overflow-hidden rounded-2xl bg-white">
        {failed ? (
          <span className="flex flex-col items-center gap-1 px-4 text-center text-xs text-zinc-500">
            <ImageOff size={22} /> Demo unavailable offline
          </span>
        ) : (
          <img
            src={gifUrl(media)}
            alt={`${name} demonstration`}
            width={180}
            height={180}
            crossOrigin="anonymous"
            onError={() => setFailed(true)}
            className="h-[180px] w-[180px] object-contain"
          />
        )}
      </div>
      <figcaption className="mt-1 text-center text-[11px] text-zinc-500">
        <a href={MEDIA_CREDIT.url} target="_blank" rel="noreferrer">
          {MEDIA_CREDIT.text} — gymvisual.com
        </a>
      </figcaption>
    </figure>
  )
}

/** Small square thumbnail for lists and cards; renders nothing if missing or it fails to load. */
export function Thumb({ media, size = 44, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!media || failed) return null
  return (
    <img
      src={thumbUrl(media)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      crossOrigin="anonymous"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-lg bg-white object-contain ${className}`}
    />
  )
}
