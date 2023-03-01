const path = require('path')
const fs = require('fs')

const dotenv = require('dotenv')

// check .env file exists
if (fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env'), override: false })
} else {
  dotenv.config({ path: path.join(__dirname, '.env.example'), override: false })
}

function getBooleanValue(text) {
  if (text === undefined) {
    return true
  }

  if (text.toLowerCase() === 'true') {
    return true
  }

  return false
}

const browserConfig = {
  browserHeadlessMode: getBooleanValue(process.env.BROWSER_HEADLESS_MODE),
  timeToWaitWhenBrowserIsLocked: 1000, // milliseconds
  waitForHTMLSelectorTimeout:
    +process.env.WAIT_FOR_HTML_SELECTOR_TIMEOUT || 30000, // milliseconds
  waitForNavigationTimeout: +process.env.WAIT_FOR_NAVIGATION_TIMEOUT || 30000, // milliseconds
  renderHTMLTimeout: +process.env.RENDER_HTML_TIMEOUT || 30000, // milliseconds
  timeToWaitJS: +process.env.TIME_TO_WAIT_JS || 100, // milliseconds
  closePageTimeout: +process.env.CLOSE_PAGE_TIMEOUT || 10000, // milliseconds
  timeToWaitBeforeClosePage:
    +process.env.TIME_TO_WAIT_BEFORE_CLOSE_PAGE || 10000, // milliseconds
  userAgent:
    process.env.USER_AGENT ||
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
}

const accountConfig = {
  usernames: process.env.USERNAMES,
  passwords: process.env.PASSWORDS,
}

module.exports = { browserConfig, accountConfig }
