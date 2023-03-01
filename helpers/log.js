const fs = require('fs')
const path = require('path')

const COLOR = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
}

class Logger {
  log

  constructor() {
    this.log = console
    this.logFile = fs.createWriteStream(path.join(__dirname, '../logs', 'debug.log'), { flags: 'a' })
  }

  getTimestamp() {
    const now = new Date()
    const date = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    // const seconds = now.getSeconds()

    return `[${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}(${('0' + date).slice(-2)})]`
  }

  error(...msg) {
    this.log.error(`${this.getTimestamp()}${COLOR.fgRed} [error]${COLOR.reset} `, ...msg)

    const am = msg.map((m) => {
      m = m.toString()
      return m
    })
    this.logFile.write(`${this.getTimestamp()} [error] ${am.join(' ')}\n`)
  }

  warn(...msg) {
    this.log.warn(`${this.getTimestamp()}${COLOR.fgYellow} [warn]${COLOR.reset} `, ...msg)

    const am = msg.map((m) => {
      m = m.toString()
      return m
    })
    this.logFile.write(`${this.getTimestamp()} [warn] ${am.join(' ')}\n`)
  }

  info(...msg) {
    this.log.info(`${this.getTimestamp()}${COLOR.fgCyan} [info]${COLOR.reset} `, ...msg)

    const am = msg.map((m) => {
      m = m.toString()
      return m
    })
    this.logFile.write(`${this.getTimestamp()} [info] ${am.join(' ')}\n`)
  }
}

module.exports = new Logger()
