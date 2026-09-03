import { type FormEvent, useEffect, useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { SectionTitle } from '../components/SectionTitle'

type RsvpSectionProps = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function RsvpSection({ isOpen, onClose, onOpen }: RsvpSectionProps) {
  const [attendance, setAttendance] = useState<'attending' | 'not-attending'>(
    'attending',
  )
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')

  useEffect(() => {
    if (isOpen) {
      setAttendance('attending')
      setSubmitStatus('idle')
    }
  }, [isOpen])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitStatus('submitting')

    const formData = new FormData(event.currentTarget)
    const guestName = String(formData.get('guestName') ?? '').trim()
    const side = formData.get('side')
    const message = String(formData.get('message') ?? '').trim()
    const requestedGuestCount = Number(formData.get('guestCount'))
    const hasPrivacyConsent = formData.get('privacyConsent') === 'on'

    if (
      !guestName ||
      !hasPrivacyConsent ||
      (side !== 'groom' && side !== 'bride') ||
      (attendance === 'attending' &&
        (!Number.isInteger(requestedGuestCount) ||
          requestedGuestCount < 1 ||
          requestedGuestCount > 10))
    ) {
      setSubmitStatus('error')
      return
    }

    try {
      const { submitRsvp } = await import('../services/rsvp')
      await submitRsvp({
        attendance,
        guestCount: attendance === 'attending' ? requestedGuestCount : 0,
        guestName,
        message,
        side,
      })
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    }
  }

  return (
    <section id="rsvp" className="content-narrow section rsvp-section">
      <SectionTitle
        eyebrow="Attendance"
        title="참석 여부"
        description={
          <>
            소중한 자리를 준비할 수 있도록
            <br />
            참석 여부를 알려주세요.
          </>
        }
      />
      <button className="rsvp-section__open" type="button" onClick={onOpen}>
        참석 여부 전달하기
      </button>

      <BottomSheet
        className="rsvp-drawer"
        contentClassName="rsvp-drawer__content"
        eyebrow="Attendance"
        isOpen={isOpen}
        layerClassName="rsvp-drawer-layer"
        onClose={onClose}
        title="참석 여부 전달"
      >
        {submitStatus === 'success' ? (
          <div className="rsvp-success" role="status">
            <span aria-hidden="true">✓</span>
            <strong>참석 여부가 전달되었습니다.</strong>
            <p>응답해 주셔서 감사합니다.</p>
            <button type="button" onClick={onClose}>
              확인
            </button>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={handleSubmit}>
            <div className="rsvp-form__scroll">
              <fieldset>
                <legend>참석 여부</legend>
                <div className="rsvp-form__choices rsvp-form__choices--attendance">
                  <label>
                    <input
                      checked={attendance === 'attending'}
                      name="attendance"
                      onChange={() => setAttendance('attending')}
                      type="radio"
                      value="attending"
                    />
                    <span>참석합니다</span>
                  </label>
                  <label>
                    <input
                      checked={attendance === 'not-attending'}
                      name="attendance"
                      onChange={() => setAttendance('not-attending')}
                      type="radio"
                      value="not-attending"
                    />
                    <span>참석이 어렵습니다</span>
                  </label>
                </div>
              </fieldset>

              <label className="rsvp-form__field">
                <span>성함</span>
                <input
                  autoComplete="name"
                  maxLength={30}
                  name="guestName"
                  placeholder="성함을 입력해 주세요"
                  required
                  type="text"
                />
              </label>

              <fieldset>
                <legend>어느 분의 하객이신가요?</legend>
                <div className="rsvp-form__choices">
                  <label>
                    <input name="side" required type="radio" value="groom" />
                    <span>신랑측</span>
                  </label>
                  <label>
                    <input name="side" required type="radio" value="bride" />
                    <span>신부측</span>
                  </label>
                </div>
              </fieldset>

              {attendance === 'attending' ? (
                <label className="rsvp-form__field">
                  <span>참석 인원</span>
                  <select defaultValue="1" name="guestCount" required>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count}명
                        </option>
                      ),
                    )}
                  </select>
                </label>
              ) : (
                <input name="guestCount" type="hidden" value="0" />
              )}

              <label className="rsvp-form__field">
                <span>
                  전달사항 <small>(선택)</small>
                </span>
                <textarea
                  maxLength={300}
                  name="message"
                  placeholder="함께 전할 말씀이 있다면 남겨주세요"
                  rows={3}
                />
              </label>

              <label className="rsvp-form__consent">
                <input name="privacyConsent" required type="checkbox" />
                <span>
                  입력한 정보를 예식 준비를 위한 참석 인원 확인에 사용하는 것에
                  동의합니다.
                </span>
              </label>

              {submitStatus === 'error' ? (
                <p className="rsvp-form__error" role="alert">
                  전송하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.
                </p>
              ) : null}
            </div>

            <footer className="rsvp-form__footer">
              <button
                className="rsvp-form__submit"
                disabled={submitStatus === 'submitting'}
                type="submit"
              >
                {submitStatus === 'submitting'
                  ? '전달 중...'
                  : '참석 여부 전달하기'}
              </button>
            </footer>
          </form>
        )}
      </BottomSheet>
    </section>
  )
}
