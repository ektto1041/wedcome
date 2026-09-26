import firstPhoto from '../assets/images/hero-photo-01.jpg'
import secondPhoto from '../assets/images/hero-photo-02.jpg'
import thirdPhoto from '../assets/images/hero-photo-03.jpg'
import fourthPhoto from '../assets/images/hero-photo-04.jpg'
import fifthPhoto from '../assets/images/hero-photo-05.jpg'
import sixthPhoto from '../assets/images/hero-photo-06.jpg'
import seventhPhoto from '../assets/images/hero-photo-07.jpg'
import eighthPhoto from '../assets/images/hero-photo-08.jpg'
import ninthPhoto from '../assets/images/hero-photo-09.jpg'
import tenthPhoto from '../assets/images/hero-photo-10.jpg'
import eleventhPhoto from '../assets/images/hero-photo-11.jpg'
import twelfthPhoto from '../assets/images/hero-photo-12.jpg'

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
    '!../assets/videos/video6.{mp4,webm,m4v}',
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

const photoStories: HeroStory[] = [
  secondPhoto,
  fifthPhoto,
  eighthPhoto,
  seventhPhoto,
  thirdPhoto,
  eleventhPhoto,
  twelfthPhoto,
  tenthPhoto,
  sixthPhoto,
  fourthPhoto,
  firstPhoto,
  ninthPhoto,
].map((src, index) => ({
  id: `hero-photo-${index + 1}`,
  src,
  label: `신랑과 신부의 웨딩 사진 ${index + 1}`,
  type: 'image',
  durationMs: 3000,
}))

export const heroStories: HeroStory[] = [
  ...photoStories.slice(0, 3),
  ...(firstVideoStory ? [firstVideoStory] : []),
  ...photoStories.slice(3, 6),
  ...(secondVideoStory ? [secondVideoStory] : []),
  ...photoStories.slice(6, 9),
  ...(thirdVideoStory ? [thirdVideoStory] : []),
  ...photoStories.slice(9),
  ...remainingVideoStories,
]
