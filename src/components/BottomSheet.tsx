import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

type BottomSheetProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  eyebrow?: string
  isOpen: boolean
  onClose: () => void
  title: string
}

const CLOSE_ANIMATION_MS = 260
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function BottomSheet({
  children,
  className = '',
  contentClassName = '',
  eyebrow,
  isOpen,
  onClose,
  title,
}: BottomSheetProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const sheetRef = useRef<HTMLElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) {
      return
    }

    isClosingRef.current = true
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      onCloseRef.current()
      setIsClosing(false)
      isClosingRef.current = false
      closeTimerRef.current = null
    }, CLOSE_ANIMATION_MS)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !sheetRef.current) {
        return
      }

      const focusableElements = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.documentElement.classList.add('is-drawer-open')
    document.body.classList.add('is-drawer-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.documentElement.classList.remove('is-drawer-open')
      document.body.classList.remove('is-drawer-open')
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [handleClose, isOpen])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      isClosingRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <div className={`drawer-layer ${isClosing ? 'is-closing' : 'is-opening'}`}>
      <button
        className="drawer-backdrop"
        type="button"
        aria-label={`${title} 닫기`}
        onClick={handleClose}
      />
      <aside
        className={`bottom-sheet ${className}`.trim()}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="bottom-sheet__header">
          <div>
            {eyebrow ? (
              <p className="bottom-sheet__eyebrow">{eyebrow}</p>
            ) : null}
            <h3 id={titleId}>{title}</h3>
          </div>
          <button
            className="bottom-sheet__close"
            ref={closeButtonRef}
            type="button"
            aria-label={`${title} 닫기`}
            onClick={handleClose}
          >
            닫기
          </button>
        </header>
        <div className={`bottom-sheet__content ${contentClassName}`.trim()}>
          {children}
        </div>
      </aside>
    </div>
  )
}
