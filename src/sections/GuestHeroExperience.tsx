import { useCallback, useEffect, useRef, useState } from 'react'
import { GuestMediaControls } from '../components/GuestMediaControls'
import { GuestMediaUploadSheet } from '../components/GuestMediaUploadSheet'
import { guestStoryConfig } from '../data/guestStoryConfig'
import { useGuestMediaUpload } from '../hooks/useGuestMediaUpload'
import { useGuestStories } from '../hooks/useGuestStories'
import { HeroSection } from './HeroSection'

type GuestHeroExperienceProps = {
  isPlaybackEnabled: boolean
  mode: 'test' | 'production'
}

type StorySource = 'guest' | 'original'

export function GuestHeroExperience({
  isPlaybackEnabled,
  mode,
}: GuestHeroExperienceProps) {
  const weddingId =
    mode === 'test'
      ? guestStoryConfig.testWeddingId
      : guestStoryConfig.productionWeddingId
  const {
    stories,
    isLoading,
    errorMessage: storyErrorMessage,
  } = useGuestStories(weddingId)
  const upload = useGuestMediaUpload(weddingId)
  const [storySource, setStorySource] = useState<StorySource>('original')
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false)
  const didResolveInitialSourceRef = useRef(false)
  const didUserChooseSourceRef = useRef(false)
  const previousGuestStoryCountRef = useRef(0)

  useEffect(() => {
    if (isLoading) {
      return
    }

    const storyCount = stories.length
    if (!didResolveInitialSourceRef.current) {
      setStorySource(storyCount > 0 ? 'guest' : 'original')
      didResolveInitialSourceRef.current = true
    } else if (storyCount === 0) {
      setStorySource('original')
    } else if (
      previousGuestStoryCountRef.current === 0 &&
      !didUserChooseSourceRef.current
    ) {
      setStorySource('guest')
    }

    previousGuestStoryCountRef.current = storyCount
  }, [isLoading, stories.length])

  const toggleStorySource = () => {
    didUserChooseSourceRef.current = true
    setStorySource((currentSource) =>
      currentSource === 'guest' ? 'original' : 'guest',
    )
  }

  const handleAllGuestStoriesFailed = useCallback(() => {
    setStorySource('original')
  }, [])

  const openUploadSheet = () => {
    upload.reset()
    setIsUploadSheetOpen(true)
  }

  const closeUploadSheet = () => {
    if (!upload.isBusy) {
      setIsUploadSheetOpen(false)
    }
  }

  const controls = (
    <GuestMediaControls
      canShowGuestStories={stories.length > 0}
      hasExistingMedia={upload.hasExistingMedia}
      onOpenUpload={openUploadSheet}
      onToggleStorySource={toggleStorySource}
      storySource={storySource}
    />
  )
  const isHeroPlaybackEnabled =
    isPlaybackEnabled && !isUploadSheetOpen && !upload.isBusy
  const isShowingGuestStories = storySource === 'guest' && stories.length > 0

  return (
    <>
      <HeroSection
        key={isShowingGuestStories ? 'guest' : 'original'}
        isPlaybackEnabled={isHeroPlaybackEnabled}
        mode={mode === 'test' ? 'upload-test' : 'default'}
        onAllStoriesFailed={
          isShowingGuestStories ? handleAllGuestStoriesFailed : undefined
        }
        progressVariant={isShowingGuestStories ? 'continuous' : 'segmented'}
        showStoryPicker={!isShowingGuestStories}
        stories={isShowingGuestStories ? stories : undefined}
        topActions={controls}
      />
      {storyErrorMessage ? (
        <p className="guest-story-load-error" role="status">
          {storyErrorMessage} 기존 이야기를 보여드리고 있어요.
        </p>
      ) : null}
      <GuestMediaUploadSheet
        errorMessage={upload.errorMessage}
        isBusy={upload.isBusy}
        isOpen={isUploadSheetOpen}
        onClose={closeUploadSheet}
        onRetry={upload.retry}
        onSelectFile={(file) => void upload.selectAndUpload(file)}
        progress={upload.progress}
        status={upload.status}
      />
    </>
  )
}
