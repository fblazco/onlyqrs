import iconSearch from './assets/icon-search.svg'
import iconLock from './assets/icon-lock.svg'
import iconWarning from './assets/icon-warning.svg'
import iconFlag from './assets/icon-flag.svg'
import iconCheck from './assets/icon-check.svg'
import iconClipboard from './assets/icon-clipboard.svg'
import iconPin from './assets/icon-pin.svg'
import iconGlobe from './assets/icon-globe.svg'
import iconShield from './assets/icon-shield.svg'
import iconMemo from './assets/icon-memo.svg'
import iconAlarm from './assets/icon-alarm.svg'
import iconFish from './assets/icon-fish.svg'
import iconChart from './assets/icon-chart.svg'
import iconReceipt from './assets/icon-receipt.svg'

// Mapeo de emojis a iconos
const emojiToIcon = {
  '🔍': iconSearch,
  '🔒': iconLock,
  '⚠️': iconWarning,
  '🚩': iconFlag,
  '✅': iconCheck,
  '📋': iconClipboard,
  '📌': iconPin,
  '🌐': iconGlobe,
  '🛡️': iconShield,
  '🔎': iconSearch, // Same as 🔍
  '📝': iconMemo,
  '🚨': iconAlarm,
  '🐟': iconFish,
  '📊': iconChart,
  '🧾': iconReceipt,
}

export function ResultContent({ content }) {
  if (!content) return null

  // Split content by lines and process each line
  const lines = content.split('\n').map((line, index) => {
    // Check for emoji at the start of the line
    const emojiRegex = /^(.*?)(🔍|🔒|⚠️|🚩|✅|📋|📌|🌐|🛡️|🔎|📝|🚨|🐟|📊|🧾)\s+/
    const match = line.match(emojiRegex)

    if (match) {
      const emoji = match[2]
      const iconSrc = emojiToIcon[emoji]
      const textAfterEmoji = line.slice(match[1].length + emoji.length).trim()

      return (
        <div key={index} className="result-line-with-icon">
          <img src={iconSrc} alt={emoji} className="result-icon" />
          <span className="result-line-text">{textAfterEmoji}</span>
        </div>
      )
    }

    return (
      <div key={index} className="result-line">
        {line}
      </div>
    )
  })

  return <div className="result-content-with-icons">{lines}</div>
}

export default ResultContent
