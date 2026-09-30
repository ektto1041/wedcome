# 하객 미디어 업로드 구체 구현 계획

## 1. 구현 목표

`?t=u` 테스트 페이지에서 먼저 아래 전체 흐름을 완성한다.

```text
이미지 또는 영상 선택
→ 파일 검사
→ 이미지만 클라이언트 압축
→ Firebase Storage 업로드
→ Firestore Story 문서 저장
→ 실시간 구독 결과에 반영
→ 새로고침 없이 Hero 재생
```

테스트가 끝날 때까지 일반 청첩장 URL의 Hero와 나머지 화면은 변경하지 않는다. 검증 완료 후 같은 컨트롤러를 일반 Hero에 연결하고, 예식 당일 노출 조건만 추가한다.

## 2. 확정 사양

- 업로드 단위: 익명 Firebase UID당 미디어 1개
- 미디어 종류: 이미지 또는 MP4 영상
- 재업로드: 기존 미디어 교체 허용
- 이미지 입력: 원본 선택 용량 제한 없음
- 이미지 처리: 클라이언트 압축 후 최대 5MB
- 영상 처리: 압축·자르기·코덱 변환 없음
- 영상 제한: 최대 10초, 최대 20MB, `video/mp4`
- 업로드 공개: 별도 승인 없이 즉시 공개
- 예상 업로더: 최대 50명
- 조회 안전 상한: 100개
- 업로드 미디어가 있으면 하객 Story를 기본 재생
- 기존 Hero는 `우리 이야기 보기` 버튼으로 전환
- 업로드 미디어가 없거나 모두 로드 실패하면 기존 Hero 표시

영상은 현재 Hero와 동일하게 음소거로 재생한다.

## 3. 테스트와 운영 데이터 분리

`?t=u`에서 올린 파일이 실제 예식 Story에 섞이지 않도록 Firebase 경로를 분리한다.

| 환경 | weddingId | 업로드 시간 제한 |
| --- | --- | --- |
| 업로드 테스트 | `2026-10-03-upload-test` | 없음 |
| 실제 청첩장 | `2026-10-03` | 2026-10-03 00:00 KST 이후 |

경로는 다음처럼 구성한다.

```text
Storage
weddings/{weddingId}/guest-stories/{uid}/media

Firestore
weddings/{weddingId}/guestStories/{uid}
```

테스트 데이터는 Firebase Console에서 컬렉션과 Storage prefix를 함께 삭제할 수 있다. `t=u`는 보안용 비밀 주소가 아니며 테스트 화면 선택자일 뿐이다.

## 4. 추가·변경 파일

### 새 파일

```text
src/
  components/
    GuestMediaControls.tsx
    GuestMediaUploadSheet.tsx
  data/
    guestStoryConfig.ts
  hooks/
    useGuestStories.ts
    useGuestMediaUpload.ts
  lib/
    firebaseAuth.ts
    firebaseStorage.ts
  services/
    guestStories.ts
  types/
    guestStory.ts
  utils/
    optimizeImage.ts
    readVideoMetadata.ts
  sections/
    GuestHeroExperience.tsx

storage.rules
```

### 변경 파일

- `src/sections/UploadHeroTestPage.tsx`
  - 현재 직접 렌더링하는 `HeroSection`을 `GuestHeroExperience`로 교체한다.
- `src/sections/HeroSection.tsx`
  - 외부 Story 목록, 진행 바 방식, 상단 액션 UI를 받을 수 있게 한다.
- `src/data/heroStories.ts`
  - 기존 Story 타입을 원격 Story에서도 사용할 수 있게 최소 확장한다.
- `src/components/BottomSheet.tsx`
  - 업로드 중 닫기 방지가 필요하면 선택적 `isDismissible` prop을 추가한다.
- `src/styles/layout.css`
  - 업로드 CTA, Story 전환 버튼, 진행률, 성공·오류 상태를 추가한다.
- `src/lib/firebase.ts`
  - 기존 Firestore export 방식은 유지한다.
- `firestore.rules`
  - `guestStories` 읽기·쓰기 규칙을 추가한다.
- `firebase.json`
  - Storage Rules 경로를 추가한다.

새 라이브러리는 추가하지 않는다. Firebase SDK, Canvas, `<video>` metadata, 기존 `BottomSheet`만 사용한다.

## 5. 설정 상수

`src/data/guestStoryConfig.ts`에 흩어지기 쉬운 값을 모은다.

```ts
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
```

`uploadOpensAt`은 `2026-10-03 00:00 KST`를 UTC로 표현한 값이다. 테스트 모드에서는 이 조건을 건너뛴다.

## 6. 데이터 타입

Firestore 문서는 완성된 업로드만 나타낸다. `uploading` 문서는 만들지 않는다.

```ts
export type GuestStoryDocument = {
  uploaderId: string
  mediaType: 'image' | 'video'
  contentType: 'image/webp' | 'image/jpeg' | 'video/mp4'
  storagePath: string
  downloadUrl: string
  byteSize: number
  width: number
  height: number
  durationMs: number | null
  revision: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

- 문서 ID는 Firebase Auth UID와 같다.
- `createdAt`은 최초 업로드 순서를 유지한다.
- 교체 시 `updatedAt`과 `revision`만 새 값으로 바꾼다.
- `revision`에는 Storage 업로드 결과의 generation을 저장한다.
- Hero URL에는 `revision`을 cache-busting 값으로 붙여 교체 직후 이전 미디어가 보이지 않게 한다.

원격 문서는 현재 `HeroStory`로 변환한다.

```ts
type HeroStory =
  | {
      id: string
      type: 'image'
      src: string
      label: string
      durationMs: number
    }
  | {
      id: string
      type: 'video'
      src: string
      label: string
    }
```

원격 Story ID는 교체 감지를 위해 `guest:{uid}:{revision}` 형식으로 만든다.

## 7. Firebase 초기화

### Authentication

`src/lib/firebaseAuth.ts`에서 `getAuth(firebaseApp)`을 한 번만 초기화한다.

`ensureAnonymousUser()`는 다음 순서로 동작한다.

1. 현재 사용자가 있으면 그대로 반환한다.
2. 없으면 `signInAnonymously()`를 호출한다.
3. 업로드 버튼을 누르기 전에는 익명 계정을 만들지 않는다.

Firebase Console에서 Anonymous Authentication provider를 활성화해야 한다.

### Storage

`src/lib/firebaseStorage.ts`에서 `getStorage(firebaseApp)`을 export한다.

Firebase 프로젝트는 Blaze 요금제 연결과 기본 Storage bucket 생성이 선행되어야 한다.

## 8. Firestore·Storage 서비스

`src/services/guestStories.ts`가 Firebase SDK 세부사항을 UI에서 분리한다.

제공할 함수:

```ts
subscribeGuestStories(weddingId, onChange, onError): Unsubscribe
getMyGuestStory(weddingId, uid): Promise<GuestStoryDocument | null>
uploadGuestMedia(input, onProgress): Promise<void>
```

### 조회

```text
weddings/{weddingId}/guestStories
orderBy(createdAt, asc)
limit(100)
```

완성 문서만 저장하므로 `status` 조건과 복합 인덱스가 필요 없다.

### 업로드

1. `ensureAnonymousUser()`로 UID를 얻는다.
2. Storage 고정 경로 `.../{uid}/media`를 만든다.
3. `uploadBytesResumable()`로 파일을 올리고 진행률을 전달한다.
4. 완료 metadata에서 generation을 얻는다.
5. `getDownloadURL()`을 얻는다.
6. UID 문서가 기존에 있으면 `createdAt`을 유지한다.
7. `setDoc()`으로 문서를 생성 또는 교체한다.

Storage 성공 후 Firestore 저장이 실패하면 같은 UID 경로로 전체 업로드를 다시 시도한다. 고정 경로를 덮어쓰므로 중복 파일은 쌓이지 않는다.

## 9. 최소 Security Rules

사용자를 신뢰하지만 공개 쓰기와 무제한 파일은 허용하지 않는다.

### Storage Rules

개념 규칙:

```text
read: 허용
create/update: 인증 UID와 경로 UID가 같을 때 허용
image/webp 또는 image/jpeg: 5MB 이하
video/mp4: 20MB 이하
delete: 본인 경로만 허용
그 외: 거부
```

영상 10초 제한은 Storage Rules에서 확인할 수 없으므로 클라이언트 검사만 적용한다.

### Firestore Rules

기존 RSVP 규칙은 그대로 유지하고 아래만 추가한다.

```text
weddings/{weddingId}/guestStories/{uploaderId}
read: 허용
create/update: request.auth.uid == uploaderId
delete: request.auth.uid == uploaderId
```

초대 코드, App Check, 관리자 role, Cloud Functions는 도입하지 않는다.

## 10. 이미지 처리

`optimizeImage(file)`은 다음 순서로 구현한다.

1. `file.type`이 `image/*`인지 확인한다.
2. `createImageBitmap()` 우선, 실패 시 `Image` fallback으로 디코딩한다.
3. EXIF 방향이 적용된 실제 너비·높이를 얻는다.
4. 긴 변을 최대 1920px로 축소한다.
5. Canvas에 그린다.
6. WebP quality 0.82로 Blob을 만든다.
7. 목표 1.5MB를 넘으면 quality를 단계적으로 낮춘다.
8. 그래도 크면 해상도를 한 단계 줄여 다시 인코딩한다.
9. WebP 생성이 실패하면 JPEG로 fallback한다.
10. 최종 5MB를 넘으면 사용자에게 처리 실패를 알린다.
11. bitmap, object URL, Canvas 참조를 즉시 정리한다.

반환값:

```ts
type OptimizedImage = {
  blob: Blob
  contentType: 'image/webp' | 'image/jpeg'
  width: number
  height: number
}
```

HEIC는 브라우저가 디코딩할 수 있을 때만 지원한다. 별도 HEIC 라이브러리는 추가하지 않는다.

## 11. 영상 검사

`readVideoMetadata(file)`은 영상을 수정하지 않고 검사만 한다.

1. MIME이 `video/mp4`인지 확인한다.
2. `file.size <= 20MB`인지 확인한다.
3. `URL.createObjectURL(file)`을 만든다.
4. 임시 `<video preload="metadata">`에 URL을 지정한다.
5. `loadedmetadata`에서 duration, videoWidth, videoHeight를 읽는다.
6. duration이 유한하고 0초 초과, 10초 이하인지 확인한다.
7. timeout과 `error` 이벤트를 처리한다.
8. object URL을 revoke한다.

반환값:

```ts
type VideoMetadata = {
  durationMs: number
  width: number
  height: number
}
```

MP4 내부 코덱은 변환하지 않는다. 업로더 기기에서 metadata를 읽을 수 없으면 거부하고, 다른 재생 기기에서 오류가 발생하면 Hero가 해당 Story를 건너뛴다.

## 12. 업로드 상태 훅

`useGuestMediaUpload()`이 Bottom Sheet가 닫혀도 업로드 상태를 유지한다.

```ts
type UploadStatus =
  | 'idle'
  | 'validating'
  | 'compressing'
  | 'uploading'
  | 'saving'
  | 'success'
  | 'error'
```

상태:

- `status`
- `progress` (`0~1`)
- `errorMessage`
- `hasExistingMedia`
- `selectedMediaType`

행동:

- `selectAndUpload(file)`
- `retry()`
- `reset()`

동시에 두 번 실행되지 않게 busy 상태에서 추가 선택을 막는다. 업로드 중 Hero 재생은 일시정지한다.

## 13. 업로드 Bottom Sheet

기존 `BottomSheet`를 재사용한다.

초기 안내:

- 세로 이미지·영상을 권장합니다.
- 이미지 또는 영상 중 하나만 올릴 수 있습니다.
- 이미지는 자동으로 최적화됩니다.
- 영상은 MP4, 10초, 20MB 이하만 가능합니다.
- 영상은 음소거로 재생됩니다.
- 업로드가 끝나면 Hero에 바로 공개됩니다.

파일 input:

```html
<input type="file" accept="image/*,video/mp4" />
```

표시 상태:

- 검사/압축 중: spinner와 단계 문구
- 업로드 중: 퍼센트 progress bar
- 저장 중: `스토리에 추가하는 중...`
- 성공: `인생샷이 추가되었습니다.`
- 기존 업로드 있음: CTA를 `내 인생샷 바꾸기`로 표시
- 오류: 구체적인 이유와 다시 선택 버튼

업로드 중 닫힘을 막기로 결정하면 `BottomSheet`에 기본값이 `true`인 `isDismissible` prop을 추가한다. 기존 RSVP 동작에는 영향이 없어야 한다.

## 14. Hero 컴포넌트 경계 조정

`HeroSection`은 Firebase를 직접 알지 않는 재생 전용 컴포넌트로 유지한다.

추가 props:

```ts
type HeroSectionProps = {
  isPlaybackEnabled: boolean
  stories?: readonly HeroStory[]
  progressVariant?: 'segmented' | 'continuous'
  showStoryPicker?: boolean
  topActions?: ReactNode
}
```

- `stories`가 없으면 기존 `heroStories`를 사용해 현재 화면을 보존한다.
- 기존 Story는 `segmented`, 하객 Story는 `continuous` 진행 바를 사용한다.
- 하객 Story의 연속 진행률은 `(activeIndex + progress) / storyCount`로 계산한다.
- 하객 Story에는 신랑·신부 `StoryPicker`를 숨긴다.
- `topActions`에 업로드와 Story 전환 버튼을 배치한다.
- 목록 전환 시 `key={storySource}`로 Hero를 remount해 인덱스, progress, media ref를 안전하게 초기화한다.
- 현재의 앞·현재·뒤 3개 렌더링 전략은 유지한다.

## 15. GuestHeroExperience 컨트롤러

`GuestHeroExperience`가 Firebase 상태와 Hero 표시 정책을 연결한다.

props:

```ts
type GuestHeroExperienceProps = {
  isPlaybackEnabled: boolean
  mode: 'test' | 'production'
}
```

상태:

```ts
type StorySource = 'guest' | 'original'
```

동작 규칙:

1. mode에 따라 test 또는 production weddingId를 선택한다.
2. Firestore 하객 Story를 실시간 구독한다.
3. 첫 조회 결과가 있으면 `guest`, 없으면 `original`로 시작한다.
4. 하객 Story가 0개에서 1개가 되면 사용자가 직접 source를 선택한 적이 없는 경우에만 `guest`로 전환한다.
5. 사용자가 `우리 이야기 보기`를 누르면 `original`로 전환한다.
6. 사용자가 `하객 인생샷 보기`를 누르면 `guest`로 전환한다.
7. 하객 Story가 모두 사라지면 `original`로 fallback한다.
8. 모든 원격 미디어가 로드 실패하면 기존 Hero fallback을 사용한다.
9. Bottom Sheet가 열렸거나 업로드 중이면 Hero 재생을 멈춘다.

테스트 모드에서는 날짜와 관계없이 업로드 CTA를 표시한다. production 모드는 KST 예식일 조건을 만족할 때만 표시한다.

## 16. 버튼 배치와 접근성

Hero 상단 레이어 순서:

```text
safe area
progress
upload CTA / source switch
story media
interaction layer
```

- 업로드 CTA: `인생샷 추가하기` 또는 `내 인생샷 바꾸기`
- source switch: `우리 이야기 보기` 또는 `하객 인생샷 보기`
- 최소 터치 영역 44×44px
- CTA는 처음 1~2회만 약한 pulse
- `prefers-reduced-motion`에서는 pulse 제거
- 버튼은 Hero 전체 탭 버튼보다 높은 z-index
- 업로드 progress는 `role="progressbar"`와 현재 값을 제공
- 오류는 `role="alert"`, 성공은 `role="status"`
- 파일 input의 시각적 버튼과 label을 명확히 연결

## 17. 구현 순서

### 1단계: Firebase 기반

- [ ] Firebase Console에서 Anonymous Authentication 활성화
- [ ] Blaze 연결 및 Storage bucket 확인
- [ ] `firebaseAuth.ts`, `firebaseStorage.ts` 추가
- [ ] `storage.rules` 추가
- [ ] `firestore.rules`에 guestStories 규칙 추가
- [ ] `firebase.json`에 Storage Rules 등록
- [ ] test/production weddingId 설정 추가

완료 조건: 테스트 코드로 익명 UID 발급, 작은 Blob 업로드, Firestore 쓰기·읽기가 가능하다.

### 2단계: 파일 처리

- [ ] `optimizeImage()` 구현
- [ ] `readVideoMetadata()` 구현
- [ ] 이미지 5MB 결과 상한 처리
- [ ] MP4 10초·20MB 검사
- [ ] object URL과 bitmap 정리

완료 조건: Firebase 없이 로컬 파일만으로 이미지 결과 Blob과 영상 metadata를 안정적으로 얻는다.

### 3단계: 데이터 서비스

- [ ] `GuestStoryDocument` 타입 추가
- [ ] 실시간 목록 구독 구현
- [ ] resumable upload와 진행률 구현
- [ ] UID 문서 생성·교체 구현
- [ ] generation 기반 cache busting 구현
- [ ] 실패 후 동일 경로 재시도 구현

완료 조건: 업로드한 미디어가 새로고침 없이 구독 결과에 나타나고 교체 후 새 파일이 보인다.

### 4단계: 업로드 UI

- [ ] 안내 Bottom Sheet 구현
- [ ] 이미지/영상 선택 분기
- [ ] 상태별 문구와 progress 구현
- [ ] 성공·오류·재시도 구현
- [ ] 기존 미디어가 있으면 교체 CTA 표시

완료 조건: 320px 화면에서 모든 상태를 조작할 수 있고 업로드 중 중복 실행이 없다.

### 5단계: Hero 주입 구조

- [ ] `HeroSection`에 stories와 topActions props 추가
- [ ] 원격 문서를 `HeroStory`로 변환
- [ ] 하객 Story에서 StoryPicker 숨김
- [ ] 50개용 continuous 진행 바 구현
- [ ] source 전환 시 재생 상태 초기화
- [ ] 원격 미디어 오류 시 건너뛰기

완료 조건: 로컬 Story와 하객 Story를 버튼으로 왕복하고 각각 처음부터 정상 재생한다.

### 6단계: `?t=u` 통합

- [ ] `UploadHeroTestPage`에 `GuestHeroExperience mode="test"` 연결
- [ ] 테스트 Firebase 경로만 사용하는지 확인
- [ ] 일반 URL의 UI와 Firebase 읽기 여부가 변하지 않았는지 확인

완료 조건: `?t=u`에서만 업로드 UI가 나타나고 일반 청첩장에는 변화가 없다.

### 7단계: 실제 청첩장 적용

- [ ] 테스트 피드백 반영
- [ ] `GuestHeroExperience mode="production"`을 일반 Hero에 연결
- [ ] 예식 당일 KST 노출 조건 적용
- [ ] 업로드 미디어 존재 시 guest 기본값 확인
- [ ] 기존 Hero 전환 버튼 확인

완료 조건: 예식일 전 일반 화면에는 CTA가 없고, 예식일부터 전체 기능이 활성화된다.

## 18. 검증 시나리오

### 이미지

- 세로·가로 JPEG
- PNG와 투명 배경
- WebP
- 10MB 이상 고해상도 원본
- 브라우저가 읽을 수 있는 HEIC
- 손상된 이미지
- 압축 후 5MB를 넘는 극단적 이미지

### 영상

- 10초 이하, 20MB 이하 MP4
- 정확히 10초에 가까운 MP4
- 10초 초과
- 20MB 초과
- MOV/WebM
- 확장자만 MP4인 잘못된 파일
- 업로더 기기에서는 읽히지만 다른 기기에서 재생 실패하는 코덱

### 네트워크와 상태

- 느린 네트워크에서 progress 갱신
- 업로드 중 Bottom Sheet 닫기
- 업로드 중 화면 잠금·복귀
- Storage 성공 후 Firestore 실패 및 재시도
- 같은 UID의 미디어 교체
- 다른 브라우저에서 실시간 추가 확인
- 50개 목록에서 진행 바와 다음 Story 전환

### Hero source

- 업로드 0개: 기존 Hero
- 첫 업로드 도착: 하객 Story 자동 전환
- 사용자가 기존 Hero 선택 후 새 업로드 도착: 선택 유지
- 하객 Story에서 기존 Hero로 왕복
- 하객 미디어 전체 실패: 기존 Hero fallback

### 화면 크기와 접근성

- 320px, 360px, 390px 모바일
- iPhone Safari
- Android Chrome
- 키보드만으로 Bottom Sheet 조작
- reduced motion
- VoiceOver 또는 TalkBack 상태 문구

## 19. 자동 검사

각 구현 단위가 끝날 때 다음을 실행한다.

```bash
pnpm exec biome check <변경 파일>
pnpm build
```

현재 저장소 전체 `pnpm check`에는 이번 기능과 무관한 기존 오류가 있으므로, 기능 변경 파일 검사를 먼저 통과시킨다. 최종 통합 전에는 기존 오류를 별도 범위로 정리한 뒤 전체 검사를 실행한다.

별도 테스트 프레임워크는 현재 프로젝트에 없으므로 첫 구현에서 추가하지 않는다. 이미지 압축과 영상 metadata 함수가 복잡해지거나 회귀가 확인되면 그때 Vite와 맞는 테스트 도구 도입을 검토한다.

## 20. 완료 기준

- `?t=u`에서 이미지 또는 MP4 한 개를 업로드할 수 있다.
- 이미지는 클라이언트에서 압축되며 영상은 원본 그대로 업로드된다.
- 영상 10초·20MB 제한이 업로드 전에 동작한다.
- 업로드 진행률과 오류가 화면에 표시된다.
- 업로드 완료 후 새로고침 없이 Hero에 나타난다.
- 업로드 미디어가 있으면 하객 Story만 기본 재생된다.
- 사용자가 기존 Hero와 하객 Story를 전환할 수 있다.
- UID당 Storage 객체와 Firestore 문서는 각각 하나만 유지된다.
- 최대 50개 Story에서 현재·이전·다음 미디어만 렌더링된다.
- 일반 청첩장 URL에는 테스트 완료 전까지 변화가 없다.
- 변경 파일 Biome 검사와 production build가 통과한다.
