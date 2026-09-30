export const guestStoryConfig = {
  productionWeddingId: '2026-10-03',
  testWeddingId: '2026-10-03-upload-test',
  uploadOpensAt: '2026-10-02T15:00:00.000Z',
  imageDurationMs: 3000,
  imageMaxOutputBytes: 5 * 1024 * 1024,
  imageTargetBytes: 1.5 * 1024 * 1024,
  imageMaxLongEdge: 1920,
  videoMaxBytes: 20 * 1024 * 1024,
  videoMaxDurationMs: 10_000,
  storyQueryLimit: 100,
} as const
