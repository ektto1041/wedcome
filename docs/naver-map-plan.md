# 네이버 지도 구현 계획

## 목표

예식 안내 섹션에서 `전통리조트 구름에`의 위치를 네이버 지도 위에 표시합니다. 모바일 청첩장 흐름을 해치지 않도록 지도는 빠르게 이해되는 보조 정보로 배치하고, 지도 로딩에 실패해도 주소와 외부 지도 링크는 계속 사용할 수 있게 합니다.

## 기준 정보

- 예식 장소: 전통리조트 구름에
- 주소 표기: 경상북도 안동시 민속촌길 190
- 좌표: 위도 `36.5716411`, 경도 `128.7683522`
- 노출 위치: 예식 안내 섹션 하단

## 사용할 API

- NAVER Maps JavaScript API v3
- SDK 로드 URL 예시:

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID"></script>
```

- 주소를 좌표로 변환해야 하는 경우 `geocoder` 서브모듈을 함께 로드합니다.

```html
<script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_CLIENT_ID&submodules=geocoder"></script>
```

참고한 공식 문서:

- NAVER Maps JavaScript API v3 시작 문서: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
- Geocoder 서브모듈 문서: https://navermaps.github.io/maps.js.en/docs/tutorial-Geocoder.html
- 주소 좌표 변환 문서: https://navermaps.github.io/maps.js.en/docs/tutorial-Geocoder-Geocoding.html

## 환경 변수

프로젝트에는 클라이언트에서 노출 가능한 네이버 지도 키만 둡니다.

```env
VITE_NAVER_MAP_CLIENT_ID=
```

네이버 클라우드 콘솔에 표시되는 `Client Secret`은 서버 API 호출용 비밀 값이므로 Vite 프론트엔드 환경 변수에 넣지 않습니다.

추가 작업:

- `.env.example`에 `VITE_NAVER_MAP_CLIENT_ID`를 추가합니다.
- 실제 `.env`는 커밋하지 않습니다.
- 네이버 클라우드 콘솔에서 로컬 개발 주소와 배포 도메인을 허용 도메인에 등록합니다.

## 구현 방향

1. 예식 장소 데이터를 확장합니다.

```ts
wedding: {
  venueName: '전통리조트 구름에',
  address: '경상북도 안동시 전통리조트 구름에',
  mapQuery: '전통리조트 구름에',
  coordinates?: {
    lat: number
    lng: number
  }
}
```

2. `NaverMap` 컴포넌트를 추가합니다.

- 위치: `src/components/NaverMap.tsx`
- 역할: SDK 로드, 지도 생성, 마커 표시, 실패 상태 표시
- props: `address`, `venueName`, 선택적으로 `coordinates`

3. SDK 로딩 유틸을 둡니다.

- 위치: `src/utils/loadNaverMapScript.ts`
- 같은 스크립트를 중복 삽입하지 않도록 Promise를 캐싱합니다.
- `VITE_NAVER_MAP_CLIENT_ID`가 없으면 지도 대신 안내 UI를 보여줍니다.

4. 좌표 처리 방식은 직접 저장 방식으로 갑니다.

- 좌표를 데이터에 저장하고 지도 중심과 마커에 사용합니다.
- 매번 클라이언트에서 주소 변환을 호출하지 않으므로 모바일에서 더 빠르고 안정적입니다.
- 주소만 있을 때 자동 좌표 변환이 필요해지면 그때 `geocoder` 서브모듈을 추가합니다.

## UI 배치

예식 안내 섹션은 아래 순서로 구성합니다.

1. 일시
2. 장소
3. 주소
4. 네이버 지도
5. 네이버 지도 앱 또는 웹으로 열기 링크

지도 스타일 기준:

- 모바일 기준 높이: `240px~280px`
- 데스크톱/태블릿 높이: `320px`
- 폭: 현재 예식 안내 섹션의 콘텐츠 폭을 따릅니다.
- 터치 영역을 확보하고, 지도 아래에 외부 지도 링크 버튼을 둡니다.
- 지도는 간단한 드래그와 핀치 확대/축소를 허용합니다.
- 마우스 휠 확대/축소는 페이지 스크롤 흐름을 방해할 수 있어 비활성화합니다.

## 접근성 및 실패 처리

- 지도 컨테이너에 장소명을 설명하는 `aria-label`을 제공합니다.
- 지도 로딩 실패 시 주소 텍스트와 네이버 지도 검색 링크를 표시합니다.
- API 키가 없을 때 개발 화면이 깨지지 않도록 빈 영역 대신 안내 문구를 보여줍니다.
- 지도만으로 위치 정보를 전달하지 않고 주소 텍스트를 항상 함께 노출합니다.

## 구현 순서

1. `.env.example` 추가: 완료
2. 예식 장소 데이터 구조 확장: 완료
3. 네이버 지도 SDK 로더 유틸 추가: 완료
4. `NaverMap` 컴포넌트 추가: 완료
5. `WeddingInfoSection`에 지도와 외부 링크 연결: 완료
6. 모바일 기준 레이아웃 스타일 추가: 완료
7. 네이버 클라우드 키와 허용 도메인 설정 후 HMR로 화면 확인: 사용자 확인

## 확정된 결정 사항

- 좌표는 직접 저장합니다.
- 지도는 간단한 드래그와 확대/축소를 허용합니다.
- 외부 링크는 네이버 지도 장소 검색 링크로 엽니다.

## 참고 출처

- NAVER Maps JavaScript API v3 시작 문서: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
- 전통리조트 구름에 주소 확인: https://www.tourandong.com/map/resource.cshtml?seq=1545
- 장소 좌표 참고: https://kr.maptons.com/p/8792153006
