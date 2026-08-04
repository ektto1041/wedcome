# 인스타그램 스토리형 Hero 설계 및 구현 기록

## 구현 상태

스토리형 Hero의 코드 구현은 완료되었습니다. `src/assets/videos/`에 실제 영상이 아직 없으므로 현재 화면에서는 기존 정적 Hero 이미지가 fallback으로 표시됩니다.

- 구현 완료: 영상 자동 탐색과 정렬, 순차 재생과 반복, 진행 바, 탭과 hold, 수동 재생/정지, 화면 이탈 정지, reduced motion, 오류 fallback
- 자동 검사 완료: `pnpm check`, `pnpm build`
- 확인 대기: 실제 영상 에셋을 사용한 iOS Safari 및 Android Chrome 실기기 검증

## 목표

현재 정적 이미지 한 장으로 구성된 Hero를 짧은 영상 여러 개가 순서대로 재생되는 스토리형 Hero로 변경합니다. 사용자는 상단 진행 바로 전체 영상 수와 현재 위치를 알 수 있고, 짧게 탭해 다음 영상으로 넘어가거나 화면을 누르고 있는 동안 재생을 잠시 멈출 수 있습니다.

핵심 경험은 다음과 같습니다.

- Hero가 보이면 첫 번째 영상이 음소거 상태로 자동 재생됩니다.
- 현재 영상이 끝나면 다음 영상이 자동 재생됩니다.
- 마지막 영상이 끝나면 첫 번째 영상으로 돌아가 계속 반복됩니다.
- 상단 진행 바는 영상 개수만큼 동일한 너비의 구간으로 나뉩니다.
- 완료한 영상의 구간은 전부 채워지고, 현재 구간은 실제 재생 위치만큼 채워집니다.
- Hero를 짧게 탭하면 현재 영상을 건너뛰고 다음 영상으로 이동합니다.
- Hero를 누르는 즉시 영상과 진행 바가 멈추고, 길게 누른 뒤 손을 떼면 같은 위치부터 재생을 이어갑니다.

## 현재 코드 기준

- `src/sections/HeroSection.tsx`
  - 활성 영상 재생, 진행률, 탭과 hold, 재생 상태 및 오류 처리를 담당합니다.
  - 영상이 없을 때 `hero-image.jpg`를 fallback으로 렌더링합니다.
- `src/styles/layout.css`
  - full-viewport 영상, 진행 바, 입력 레이어, 재생 버튼과 reduced-motion 스타일을 관리합니다.
- `src/data/heroStories.ts`
  - `src/assets/videos/`의 지원 영상 파일을 자동 탐색하고 재생 순서대로 정렬합니다.
- `src/assets/videos/`
  - Hero 영상 에셋을 두는 폴더이며 현재는 빈 폴더를 유지하기 위한 `.gitkeep`만 있습니다.

기존 Hero의 전체 화면 레이아웃, 그라데이션, 하단 제목은 유지하며 그 아래에 영상 레이어를 추가했습니다.

## 에셋 및 데이터 구조

영상은 아래와 같이 별도 폴더에서 관리합니다.

```text
src/assets/videos/
  hero-01.mp4
  hero-02.mp4
  hero-03.mp4
```

모바일 브라우저 호환성을 위해 우선 H.264 비디오와 AAC 오디오를 담은 MP4를 기준 포맷으로 사용합니다. 자동 재생은 음소거 상태이므로 영상에 소리가 없어도 됩니다. 영상은 Hero 비율에 맞게 세로 촬영본을 우선하고, 용량과 해상도는 모바일 첫 로딩을 고려해 최적화합니다.

영상 목록은 컴포넌트 JSX에 직접 반복해서 쓰지 않고 `src/data/heroStories.ts`에 분리합니다. 이 파일은 Vite의 `import.meta.glob`으로 지원 확장자의 영상 파일을 찾아 파일명의 숫자를 고려한 오름차순으로 정렬합니다. 따라서 새 영상을 추가할 때 코드의 import 목록을 함께 수정할 필요가 없습니다.

```ts
export type HeroStory = {
  id: string
  src: string
  label: string
}

const videoModules = import.meta.glob<string>(
  '../assets/videos/*.{mp4,webm,m4v}',
  { eager: true, import: 'default', query: '?url' },
)

export const heroStories: HeroStory[] = Object.entries(videoModules)
  // 파일명 순으로 정렬하고 HeroStory 객체로 변환
```

- `id`: React key와 영상 식별에 사용합니다.
- `src`: 로컬 영상 import 결과를 사용합니다.
- `label`: 스크린 리더용 현재 영상 설명에 사용합니다.
- 재생 시간은 데이터에 중복 저장하지 않고 `<video>`가 제공하는 실제 `duration`을 사용합니다.

## 컴포넌트 범위

초기 구현은 반복이 아직 한 곳뿐이므로 과도하게 컴포넌트를 나누지 않습니다.

- `HeroSection`
  - 현재 영상 인덱스와 재생 상태를 관리합니다.
  - `<video>` 이벤트를 처리합니다.
  - 탭과 길게 누르기 입력을 구분합니다.
  - 진행 바와 기존 제목을 함께 렌더링합니다.
- `HeroProgress`
  - 영상 개수, 현재 인덱스, 현재 진행률을 받아 상단 구간을 렌더링하는 작은 표시 전용 컴포넌트입니다.
  - 상태나 타이머를 직접 소유하지 않습니다.

재생 로직이 커질 경우에만 후속 작업으로 `useHeroStories` 훅을 추출합니다. 첫 구현에서는 관련 로직을 `HeroSection` 가까이에 두어 흐름을 한눈에 확인할 수 있게 합니다.

## 상태 모델

React 상태와 ref의 역할을 분리합니다.

### React 상태

- `activeIndex`: 현재 재생 중인 영상의 인덱스
- `progress`: 현재 영상의 `currentTime / duration` 값, 범위는 `0~1`
- `isHolding`: 사용자가 화면을 계속 누르고 있는지 여부
- `isReady`: 현재 영상이 `canplay` 상태인지 여부
- `isInView`: Hero가 viewport에 충분히 보이는지 여부
- `isPageHidden`: 브라우저 탭 또는 앱이 background 상태인지 여부
- `isManuallyPaused`: 사용자가 재생 버튼으로 정지했는지 여부
- `hasUserStarted`: reduced-motion 환경에서 사용자가 직접 재생을 허용했는지 여부
- `failedStoryIds`: 로드에 실패해 재생 목록에서 제외할 영상 ID 집합
- `prefersReducedMotion`: 시스템의 모션 축소 설정 여부

### ref

- `videoRef`: 현재 `<video>` DOM 요소
- `animationFrameRef`: 진행률 갱신용 `requestAnimationFrame` ID
- `pressStartedAtRef`: pointer down 시각
- `pressStartPointRef`: pointer down 좌표
- `didMoveRef`: 누른 뒤 스크롤이나 드래그가 발생했는지 여부

`activeIndex`가 바뀌면 진행률과 준비 상태를 초기화하고 새 영상의 metadata와 재생을 기다립니다.

## 재생 흐름

### 최초 진입

1. 첫 번째 영상을 렌더링합니다.
2. `<video muted playsInline autoPlay>` 속성으로 모바일 자동 재생 조건을 충족합니다.
3. `loadedmetadata` 또는 `canplay` 이후 `play()`를 호출합니다.
4. `play()` Promise가 거절되면 예외를 삼키지 않고 정지 상태 UI로 전환합니다.

### 다음 영상 이동

`goToNextStory()` 하나가 자동 전환과 탭 전환을 모두 담당합니다.

```text
nextIndex = (activeIndex + 1) % storyCount
```

- `ended` 이벤트가 발생하면 `goToNextStory()`를 호출합니다.
- 짧은 탭이 확정되면 같은 함수를 호출합니다.
- 마지막 영상 다음에는 인덱스가 `0`이 되어 전체 목록이 반복됩니다.
- 전환 직전에 현재 영상은 정지시키고 새 영상의 진행률은 `0`으로 초기화합니다.

### 진행률 동기화

CSS 타이머로 재생 시간을 추측하지 않고 실제 영상 시간을 기준으로 계산합니다.

```text
progress = clamp(video.currentTime / video.duration, 0, 1)
```

- 영상 재생 중에는 `requestAnimationFrame`으로 진행률을 갱신해 짧은 영상에서도 부드럽게 보이도록 합니다.
- hold, 브라우저 자동 정지, buffering 중에는 영상 시간이 멈추므로 진행 바도 같은 위치에 머뭅니다.
- `pause`, `waiting`, `ended`, 컴포넌트 unmount 시 animation frame을 정리합니다.
- `duration`이 아직 없거나 유효하지 않으면 진행률은 `0`으로 유지합니다.

## 탭과 길게 누르기

Pointer Events를 사용해 touch, mouse, pen 입력을 하나의 흐름으로 처리합니다.

### pointer down

1. 시작 시각과 좌표를 ref에 기록합니다.
2. `isHolding`을 `true`로 바꿉니다.
3. 영상을 즉시 `pause()`합니다.
4. 진행 바는 현재 위치에서 멈춥니다.

### pointer move

- 시작점에서 일정 거리 이상 움직이면 탭이 아니라 스크롤 또는 드래그로 판단합니다.
- 이 경우 다음 영상으로 이동하지 않습니다.
- 세로 스크롤은 막지 않도록 인터랙션 레이어에 `touch-action: pan-y`를 적용합니다.

### pointer up

- 누른 시간이 탭 기준 시간보다 짧고 이동 거리가 허용 범위 안이면 짧은 탭으로 판단하여 다음 영상으로 이동합니다.
- 그 외에는 길게 누르기로 판단하여 현재 영상의 같은 위치에서 `play()`를 재개합니다.
- 탭 기준값은 구현 상수로 명확히 두며 초기값은 약 `200ms`로 시작합니다.

### 취소 상황

- `pointercancel` 또는 창 포커스 상실이 발생하면 hold 상태를 해제합니다.
- 스크롤 때문에 취소된 입력은 다음 영상으로 처리하지 않습니다.
- Hero가 보이는 상태라면 현재 영상을 재개하고, 화면 밖이라면 정지 상태를 유지합니다.
- 모바일의 길게 누르기 컨텍스트 메뉴와 텍스트 선택이 Hero 위에 나타나지 않도록 필요한 범위에서만 방지합니다.

## 진행 바 UI

진행 바는 Hero 상단 safe area 아래에 위치합니다.

```text
[ 완료 ][ 현재 64% ][ 대기 ][ 대기 ]
```

- 전체 트랙은 `display: grid`와 `repeat(storyCount, 1fr)`로 동일 분할합니다.
- 각 구간 사이에는 작은 gap을 둡니다.
- 이전 구간의 fill은 `100%`입니다.
- 현재 구간의 fill은 `progress * 100%`입니다.
- 다음 구간의 fill은 `0%`입니다.
- 컨테이너는 `padding-top: calc(env(safe-area-inset-top) + ...)`로 노치 영역을 피합니다.
- 어두운 영상과 밝은 영상 모두에서 보이도록 반투명 트랙, 밝은 fill, 약한 shadow를 사용합니다.
- fill 변경에는 별도 duration 기반 CSS animation을 사용하지 않습니다. 실제 미디어 시간에서 전달된 값만 시각화합니다.

진행 바는 장식적 상태 표시이므로 개별 구간을 버튼으로 만들지 않습니다. 현재 위치는 `aria-live="polite"` 상태 문구로 "총 3개 중 2번째 영상"처럼 전달합니다.

## 영상 렌더링과 전환

- 현재 영상과 다음 영상은 Hero 전체에 `position: absolute; inset: 0`으로 겹쳐 배치합니다.
- `width`와 `height`는 `100%`, `object-fit`은 `cover`를 사용합니다.
- 기존 이미지와 동일하게 중앙 정렬을 기본으로 하되 영상별 초점 조정이 필요하면 데이터에 `objectPosition`을 나중에 추가합니다.
- 다음 영상은 실제 전환에 사용할 `<video>` 요소로 미리 유지합니다. 새 영상이 `canplay` 상태가 될 때까지 현재 영상의 마지막 프레임을 남기고, 준비가 끝난 순간 애니메이션 없이 즉시 교체합니다.
- 기존 Hero 그라데이션과 제목은 영상보다 위, 입력 레이어와 진행 바보다 아래 또는 의도한 z-index 순서에 배치합니다.
- 첫 영상은 즉시 로드하고 다음 영상 요소만 함께 preload합니다. 전환이 끝나면 그다음 영상 요소를 새로 준비하므로 모든 영상을 최초 진입에 동시에 내려받지 않습니다.
- 다음 영상 preload가 늦어져도 현재 프레임을 유지하며 Hero fallback 이미지가 영상 사이에 노출되지 않게 합니다.

권장 레이어 순서는 아래와 같습니다.

```text
video/fallback image
gradient overlay
interaction target
title content
progress indicator and playback control
```

## 화면 이탈과 브라우저 상태

Hero가 화면 밖으로 스크롤된 뒤에도 영상이 계속 재생되지 않도록 `IntersectionObserver`를 사용합니다.

- Hero가 충분히 보일 때만 자동 재생합니다.
- Hero가 viewport 밖으로 나가면 현재 영상을 정지합니다.
- 다시 보이면 같은 위치에서 재생을 이어갑니다.
- `document.visibilitychange`로 탭이나 앱이 백그라운드로 이동한 경우에도 정지합니다.
- foreground로 돌아오면 Hero가 보이고 hold 중이 아닐 때만 재생합니다.

이 동작은 배터리와 데이터 사용을 줄이고, 사용자가 아래 섹션을 읽는 동안 영상 인덱스가 임의로 바뀌는 것을 방지합니다.

## 접근성과 모션 설정

- 영상은 `muted`와 `playsInline`을 항상 사용합니다.
- 영상 자체는 정보를 단독으로 전달하지 않으며, 신랑·신부 이름 등 핵심 정보는 기존 HTML 텍스트로 유지합니다.
- 투명한 입력 영역에는 "다음 영상 보기, 길게 누르면 일시정지"라는 접근 가능한 이름을 제공합니다.
- 키보드 사용자는 `Enter`로 다음 영상, `Space`로 재생/정지를 조작할 수 있게 합니다.
- 자동 반복 콘텐츠를 확실하게 멈출 수 있도록 진행 바 주변에 최소 크기 44px의 재생/일시정지 버튼을 둡니다. 이 버튼 입력은 Hero 탭 이벤트로 전파되지 않게 합니다.
- `prefers-reduced-motion: reduce`에서는 자동 재생을 시작하지 않고 poster 또는 첫 프레임을 보여주며, 사용자가 재생 버튼을 눌렀을 때만 재생합니다.
- reduced motion 환경에서는 자동 재생을 시작하지 않고 사용자가 직접 재생할 수 있게 합니다.

## 오류 및 예외 처리

- 영상 배열이 비어 있으면 기존 정적 Hero 이미지를 fallback으로 렌더링합니다.
- 한 영상이 로드되지 않으면 오류 상태를 기록하고 다음 재생 가능한 영상으로 넘어갑니다.
- 모든 영상이 실패한 경우 무한한 skip 반복을 막고 정적 poster/fallback 이미지를 표시합니다.
- `play()`가 자동 재생 정책으로 거절되면 재생 버튼을 표시하고 사용자 입력을 기다립니다.
- `duration`이 `NaN`, `Infinity`, `0`인 동안 진행률 계산을 하지 않습니다.
- 영상이 하나뿐인 경우에는 인덱스를 변경하지 않고 재생 위치를 처음으로 되돌려 반복합니다.
- 컴포넌트가 unmount될 때 animation frame, observer와 이벤트 리스너를 정리합니다.

## 성능 기준

- 첫 영상 외의 모든 영상에 eager download를 강제하지 않습니다.
- 영상 파일은 모바일 화면에서 필요한 수준으로 인코딩하고 불필요한 고해상도 원본을 그대로 포함하지 않습니다.
- poster가 있다면 실제 표시 크기에 맞춘 최적화 이미지를 사용합니다.
- 재생 진행률 갱신은 React 전체 페이지가 아니라 `HeroSection`과 `HeroProgress` 범위만 다시 렌더링하게 합니다.
- Hero 아래 이미지와 기존 갤러리의 지연 로딩 동작을 방해하지 않습니다.
- 새 외부 재생 라이브러리는 추가하지 않고 브라우저 Media API로 구현합니다.

## 구현 내역

1. `src/assets/videos/`와 자동 탐색 데이터 모듈을 추가했습니다.
2. `HeroSection`에 `<video>` 기반 활성 미디어 레이어를 추가했습니다.
3. 자동 재생, `ended`, 순환 인덱스 변경과 단일 영상 반복을 연결했습니다.
4. 실제 `currentTime` 기반 진행률 계산과 `HeroProgress`를 구현했습니다.
5. Pointer Events 기반 탭, hold, 이동 거리 판정과 취소 처리를 추가했습니다.
6. 상단 safe-area 진행 바와 재생/일시정지 컨트롤 스타일을 추가했습니다.
7. 실제 다음 영상 요소를 DOM에 유지해 preload하고, 준비 완료 시 애니메이션 없이 즉시 교체하도록 연결했습니다.
8. viewport 및 document visibility에 따른 정지와 재개를 추가했습니다.
9. reduced motion, 키보드 조작, 스크린 리더 상태 문구를 추가했습니다.
10. 로드 실패, autoplay 거절, 빈 배열 fallback을 처리했습니다.
11. Biome 검사와 production build를 통과했습니다.
12. 실제 에셋 추가 후 모바일 실기기 검증이 남아 있습니다.

## 완료 기준

### 기본 재생

- 첫 영상이 Hero 진입 시 음소거로 자동 재생됩니다.
- 각 영상은 자신의 실제 길이만큼 재생된 뒤 다음 영상으로 넘어갑니다.
- 마지막 영상 이후 첫 영상으로 자연스럽게 돌아갑니다.
- 영상 전환 시 이전 영상의 소리, timer, animation frame이 남지 않습니다.

### 진행 바

- 영상 수와 진행 바 구간 수가 항상 일치합니다.
- 현재 구간은 영상의 실제 재생 위치와 시각적으로 동기화됩니다.
- hold, buffering, 화면 이탈 때 영상과 진행 바가 함께 멈춥니다.
- 다음 영상으로 이동하면 이전 구간은 완료 상태, 새 구간은 0부터 시작합니다.

### 입력

- 짧은 탭 한 번으로 정확히 다음 영상 하나만 이동합니다.
- 누르는 순간 재생이 멈춥니다.
- 길게 누른 뒤 놓으면 다음 영상으로 넘어가지 않고 같은 영상의 같은 위치부터 이어집니다.
- 세로 스크롤, pointer cancel, 빠른 연속 입력이 의도하지 않은 전환을 만들지 않습니다.
- 재생/일시정지 버튼 조작이 다음 영상 탭으로 처리되지 않습니다.

### 모바일 및 접근성

- iOS Safari와 Android Chrome에서 inline 자동 재생이 동작합니다.
- `320px` 너비와 노치가 있는 화면에서 진행 바와 제목이 잘리지 않습니다.
- Hero 밖으로 스크롤하거나 브라우저가 백그라운드로 가면 영상이 멈춥니다.
- 키보드만으로 다음 영상 이동과 재생/정지가 가능합니다.
- reduced motion 설정에서는 자동 재생되지 않습니다.

## 후속 확인 항목

- 실제 영상 파일과 원하는 재생 순서
- 영상에서 인물이 잘리지 않도록 필요한 `object-position` 값
- 재생/일시정지 버튼의 최종 시각 형태
- 실제 영상 용량과 첫 재생 시작 시간
- iOS Safari와 Android Chrome에서의 탭, hold 및 자동 재생 동작

임시 영상 경로나 가짜 타이머는 사용하지 않았습니다. 실제 재생과 전환 품질은 최종 인코딩된 에셋을 기준으로 확인합니다.
