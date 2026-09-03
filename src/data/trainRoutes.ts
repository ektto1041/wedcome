export type TrainRouteId = 'seoul' | 'cheongnyangni'

export type TrainTicket = {
  trainName: string
  trainNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  adultFare: string
}

export type TrainRoute = {
  id: TrainRouteId
  departureStation: string
  arrivalStation: string
  sourceLabel: string
  sourceUpdatedAt: string
  bookingUrl: string
  tickets: TrainTicket[]
}

const korailBookingUrl = 'https://www.korail.com/ticket/search/general'

export const trainRoutes: TrainRoute[] = [
  {
    id: 'seoul',
    departureStation: '서울역',
    arrivalStation: '안동역',
    sourceLabel: '한국철도공사 공식 시간표',
    sourceUpdatedAt: '2026-09-01',
    bookingUrl: korailBookingUrl,
    tickets: [
      {
        trainName: 'KTX-이음',
        trainNumber: '705',
        departureTime: '08:57',
        arrivalTime: '11:12',
        duration: '2시간 15분',
        adultFare: '29,300원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '707',
        departureTime: '10:59',
        arrivalTime: '13:26',
        duration: '2시간 27분',
        adultFare: '29,300원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '709',
        departureTime: '12:55',
        arrivalTime: '15:11',
        duration: '2시간 16분',
        adultFare: '29,300원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '711',
        departureTime: '13:55',
        arrivalTime: '16:13',
        duration: '2시간 18분',
        adultFare: '29,300원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '715',
        departureTime: '16:11',
        arrivalTime: '18:38',
        duration: '2시간 27분',
        adultFare: '29,300원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '719',
        departureTime: '21:31',
        arrivalTime: '23:51',
        duration: '2시간 20분',
        adultFare: '29,300원',
      },
    ],
  },
  {
    id: 'cheongnyangni',
    departureStation: '청량리역',
    arrivalStation: '안동역',
    sourceLabel: '한국철도공사 공식 시간표',
    sourceUpdatedAt: '2026-09-01',
    bookingUrl: korailBookingUrl,
    tickets: [
      {
        trainName: 'KTX-이음',
        trainNumber: '701',
        departureTime: '05:40',
        arrivalTime: '07:34',
        duration: '1시간 54분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '703',
        departureTime: '06:27',
        arrivalTime: '08:31',
        duration: '2시간 4분',
        adultFare: '27,700원',
      },
      {
        trainName: 'ITX-마음',
        trainNumber: '1601',
        departureTime: '06:38',
        arrivalTime: '09:16',
        duration: '2시간 38분',
        adultFare: '21,100원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '705',
        departureTime: '09:18',
        arrivalTime: '11:12',
        duration: '1시간 54분',
        adultFare: '27,700원',
      },
      {
        trainName: 'ITX-마음',
        trainNumber: '1611',
        departureTime: '10:40',
        arrivalTime: '13:13',
        duration: '2시간 33분',
        adultFare: '21,100원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '707',
        departureTime: '11:20',
        arrivalTime: '13:26',
        duration: '2시간 6분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '709',
        departureTime: '13:16',
        arrivalTime: '15:11',
        duration: '1시간 55분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '781',
        departureTime: '13:57',
        arrivalTime: '15:46',
        duration: '1시간 49분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '711',
        departureTime: '14:17',
        arrivalTime: '16:13',
        duration: '1시간 56분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '713',
        departureTime: '14:40',
        arrivalTime: '16:36',
        duration: '1시간 56분',
        adultFare: '27,700원',
      },
      {
        trainName: 'ITX-마음',
        trainNumber: '1603',
        departureTime: '14:48',
        arrivalTime: '17:31',
        duration: '2시간 43분',
        adultFare: '21,100원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '715',
        departureTime: '16:32',
        arrivalTime: '18:38',
        duration: '2시간 6분',
        adultFare: '27,700원',
      },
      {
        trainName: 'ITX-마음',
        trainNumber: '1613',
        departureTime: '17:38',
        arrivalTime: '20:15',
        duration: '2시간 37분',
        adultFare: '21,100원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '717',
        departureTime: '19:00',
        arrivalTime: '20:56',
        duration: '1시간 56분',
        adultFare: '27,700원',
      },
      {
        trainName: 'KTX-이음',
        trainNumber: '719',
        departureTime: '21:52',
        arrivalTime: '23:51',
        duration: '1시간 59분',
        adultFare: '27,700원',
      },
    ],
  },
]
