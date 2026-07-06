import heroImage from '../assets/images/hero-image.png'

export const invitation = {
  couple: {
    groom: '박상연',
    bride: '김영진',
  },
  wedding: {
    dateLabel: '2026년 10월 3일 토요일 오후 4시 30분',
    venueName: '전통리조트 구름에',
    address: '경상북도 안동시 민속촌길 190',
    mapQuery: '전통리조트 구름에',
    mapUrl:
      'https://map.naver.com/p/search/%EC%A0%84%ED%86%B5%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EA%B5%AC%EB%A6%84%EC%97%90',
    coordinates: {
      lat: 36.5716411,
      lng: 128.7683522,
    },
  },
  transportation: {
    trainBookingUrl: 'https://www.korail.com/ticket/search/general',
    trainRoutes: [
      {
        id: 'seoul',
        station: '서울역',
        summary:
          '서울역에서 중앙선 KTX-이음 열차를 이용해 안동역에서 하차하시면 됩니다.',
        note: '서울역 출발편은 운행 횟수가 제한적일 수 있으니 예매 전 시간표를 확인해 주세요.',
      },
      {
        id: 'cheongnyangni',
        station: '청량리역',
        summary:
          '청량리역에서 중앙선 KTX-이음 열차를 이용해 안동역에서 하차하시면 됩니다.',
        note: '청량리역 출발편은 서울역보다 운행 선택지가 더 많은 편입니다.',
      },
    ],
    arrivalNote:
      '안동역에서 전통리조트 구름에까지는 차량으로 약 15~20분 정도 소요됩니다.',
    bookingNote:
      '코레일 예매 화면에서 출발역을 서울역 또는 청량리역, 도착역을 안동역으로 입력해 조회해 주세요.',
  },
  message:
    '서로의 계절을 닮아가며 함께 걷기로 했습니다. 소중한 분들을 모시고 감사한 마음으로 첫걸음을 나누고 싶습니다.',
  contacts: [
    { label: '신랑에게 연락', href: 'tel:010-1234-5678' },
    { label: '신부에게 연락', href: 'tel:010-9876-5432' },
  ],
  gallery: [
    {
      id: 'sunlit-lobby',
      src: heroImage,
      alt: '햇살이 드는 공간에 함께 선 웨딩 이미지',
    },
    {
      id: 'bouquet-detail',
      src: heroImage,
      alt: '부케와 웨딩 디테일 이미지',
    },
    {
      id: 'walking-together',
      src: heroImage,
      alt: '함께 걷는 두 사람의 웨딩 이미지',
    },
    {
      id: 'quiet-moment',
      src: heroImage,
      alt: '조용히 마주 선 두 사람의 웨딩 이미지',
    },
    {
      id: 'wedding-place',
      src: heroImage,
      alt: '예식 공간의 따뜻한 분위기 이미지',
    },
    {
      id: 'soft-light',
      src: heroImage,
      alt: '부드러운 빛이 담긴 웨딩 스냅 이미지',
    },
  ],
} as const
