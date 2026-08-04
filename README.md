# Wedcome

모바일 우선 청첩장 웹앱 프로젝트입니다.

## Stack

- React
- Vite
- TypeScript
- Biome

## Start

```bash
pnpm install
pnpm dev
```

Node 버전은 `.nvmrc` 기준인 `22.12.0`을 사용합니다.

```bash
nvm use
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm check
pnpm format
```

## Structure

```text
src/
  assets/
  components/
  data/
  hooks/
  sections/
  styles/
  utils/
  App.tsx
  main.tsx
```

## Layout Notes

- 모바일 기준 폭은 `360px` 또는 `375px`에서 먼저 확인합니다.
- 콘텐츠 래퍼는 `max-width: 720px`를 기본값으로 사용합니다.
- 큰 화면에서는 콘텐츠 폭은 고정되고 좌우 여백만 늘어나는 구조를 따릅니다.
- 문장 중심 섹션은 `content-narrow` 패턴으로 더 좁게 관리합니다.

## Hero 영상 관리

Hero는 인스타그램 스토리처럼 짧은 영상을 순서대로 재생합니다. 영상 파일은 아래 폴더에 추가합니다.

```text
src/assets/videos/
  hero-01.mp4
  hero-02.mp4
  hero-03.mp4
```

- 지원 확장자는 `.mp4`, `.webm`, `.m4v`입니다.
- 파일명은 숫자를 고려한 오름차순으로 정렬되므로 원하는 재생 순서를 파일명에 반영합니다.
- 목록을 별도 코드에 등록할 필요 없이 `src/data/heroStories.ts`가 파일을 자동으로 인식합니다.
- 영상이 없거나 모든 영상 로드에 실패하면 기존 Hero 이미지가 표시됩니다.
- 모바일 호환성을 위해 H.264 기반 MP4를 우선 사용하고, 세로 화면에 맞게 용량과 해상도를 최적화합니다.
- 자동 재생은 브라우저 정책에 맞춰 음소거 및 inline 방식으로 동작합니다.

Hero에서는 짧게 탭해 다음 영상으로 이동하고, 누르고 있는 동안 일시정지할 수 있습니다. 상단 버튼으로 재생 상태를 고정해서 바꿀 수도 있습니다.

세부 동작과 예외 처리 기준은 [`docs/hero-story-plan.md`](docs/hero-story-plan.md)를 참고합니다.
