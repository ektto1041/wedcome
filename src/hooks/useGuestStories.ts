import { useEffect, useMemo, useState } from 'react'
import { guestStoryConfig } from '../data/guestStoryConfig'
import type { HeroStory } from '../data/heroStories'
import { subscribeGuestStories } from '../services/guestStories'
import type { GuestStoryRecord } from '../types/guestStory'

function withRevision(downloadUrl: string, revision: string) {
  try {
    const url = new URL(downloadUrl)
    url.searchParams.set('revision', revision)
    return url.toString()
  } catch {
    const separator = downloadUrl.includes('?') ? '&' : '?'
    return `${downloadUrl}${separator}revision=${encodeURIComponent(revision)}`
  }
}

function toHeroStory(story: GuestStoryRecord): HeroStory {
  const baseStory = {
    id: `guest:${story.uploaderId}:${story.revision}`,
    src: withRevision(story.downloadUrl, story.revision),
    label: '하객이 올린 결혼식 인생샷',
  }

  if (story.mediaType === 'image') {
    return {
      ...baseStory,
      type: 'image',
      durationMs: guestStoryConfig.imageDurationMs,
    }
  }

  return { ...baseStory, type: 'video' }
}

export function useGuestStories(weddingId: string) {
  const [records, setRecords] = useState<GuestStoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setErrorMessage(null)

    return subscribeGuestStories(
      weddingId,
      (nextRecords) => {
        setRecords(nextRecords)
        setIsLoading(false)
      },
      () => {
        setErrorMessage('하객 스토리를 불러오지 못했습니다.')
        setIsLoading(false)
      },
    )
  }, [weddingId])

  const stories = useMemo(() => records.map(toHeroStory), [records])

  return { records, stories, isLoading, errorMessage }
}
