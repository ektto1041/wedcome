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
