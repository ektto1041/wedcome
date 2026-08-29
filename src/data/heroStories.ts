import firstStoryImage from '../assets/images/hero-story-1.jpg'
import fifthStoryImage from '../assets/images/hero-story-5.jpg'
import seventhStoryImage from '../assets/images/hero-story-7.jpg'
import ninthStoryImage from '../assets/images/hero-story-9.jpg'

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
  [
    '../assets/videos/*.{mp4,webm,m4v}',
    '!../assets/videos/video4.{mp4,webm,m4v}',
    '!../assets/videos/video5.{mp4,webm,m4v}',
  ],
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
)

const videoStories: HeroStory[] = Object.entries(videoModules)
  .sort(([firstPath], [secondPath]) =>
    firstPath.localeCompare(secondPath, undefined, { numeric: true }),
  )
  .map(([path, src], index) => ({
    id: path.split('/').pop() ?? `hero-story-${index + 1}`,
    src,
    label: `웨딩 영상 ${index + 1}`,
    type: 'video',
  }))

const [
  firstVideoStory,
  secondVideoStory,
  thirdVideoStory,
  ...remainingVideoStories
] = videoStories

export const heroStories: HeroStory[] = [
  {
    id: 'hero-story-image-1',
    src: firstStoryImage,
    label: '함께 앉아 있는 신랑과 신부',
    type: 'image',
    durationMs: 3000,
  },
  ...(firstVideoStory ? [firstVideoStory] : []),
  {
    id: 'hero-story-image-5',
    src: fifthStoryImage,
    label: '함께 앉아 서로를 바라보는 신랑과 신부',
    type: 'image',
    durationMs: 3000,
  },
  ...(secondVideoStory ? [secondVideoStory] : []),
  {
    id: 'hero-story-image-7',
    src: seventhStoryImage,
    label: '나란히 서 있는 신랑과 신부',
    type: 'image',
    durationMs: 3000,
  },
  ...(thirdVideoStory ? [thirdVideoStory] : []),
  {
    id: 'hero-story-image-9',
    src: ninthStoryImage,
    label: '침대에 앉아 서로를 바라보는 신랑과 신부',
    type: 'image',
    durationMs: 3000,
  },
  ...remainingVideoStories,
]
