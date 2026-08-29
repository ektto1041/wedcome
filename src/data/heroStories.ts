type HeroStoryBase = {
  id: string
  src: string
  label: string
}

export type HeroStory =
  | (HeroStoryBase & {
      type: 'image'
      durationMs: number
    })
  | (HeroStoryBase & {
      type: 'video'
    })

const videoModules = import.meta.glob<string>(
  '../assets/videos/*.{mp4,webm,m4v}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

export const heroStories: HeroStory[] = Object.entries(videoModules)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, { numeric: true }),
  )
  .map(([path, src], index) => ({
    id: path.split('/').pop() ?? `hero-story-${index + 1}`,
    src,
    label: `웨딩 영상 ${index + 1}`,
    type: 'video',
  }))
