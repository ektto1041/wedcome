import { useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { invitation } from '../data/invitation'

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export function MoneyGiftSection() {
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null)

  const handleCopy = async (
    accountId: string,
    bankName: string,
    accountNumber: string,
  ) => {
    try {
      await copyToClipboard(`${bankName} ${accountNumber}`)
      setCopiedAccountId(accountId)
      window.setTimeout(() => {
        setCopiedAccountId((currentId) =>
          currentId === accountId ? null : currentId,
        )
      }, 2000)
    } catch {
      setCopiedAccountId(null)
    }
  }

  return (
    <section id="gift" className="content-narrow section">
      <SectionTitle
        eyebrow="Gift"
        title="마음 전하실 곳"
        description={
          <>
            참석이 어려우신 분들을 위해 계좌번호를
            <br />
            함께 안내드립니다.
          </>
        }
      />
      <div className="gift-account-list">
        {invitation.bankAccounts.map((group) => (
          <section key={group.id} className="gift-account-group">
            <h3 className="gift-account-group__title">{group.label}</h3>
            {group.accounts.map((account) => {
              const isCopied = copiedAccountId === account.id

              return (
                <article key={account.id} className="gift-account-card">
                  <div className="gift-account-card__body">
                    <p className="gift-account-card__holder">
                      예금주 {account.accountHolder}
                    </p>
                    <div className="gift-account-card__details">
                      <p className="gift-account-card__bank">
                        {account.bankName}
                      </p>
                      <p className="gift-account-card__number">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gift-account-card__copy"
                    onClick={() =>
                      handleCopy(
                        account.id,
                        account.bankName,
                        account.accountNumber,
                      )
                    }
                  >
                    {isCopied ? '완료' : '복사'}
                  </button>
                </article>
              )
            })}
          </section>
        ))}
      </div>
    </section>
  )
}
