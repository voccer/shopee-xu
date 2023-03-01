const puppeteer = require('puppeteer')

const logger = require('./helpers/log')
const { browserConfig } = require('./config')
const { sleepWithReturnFlg, sleep } = require('./helpers/utils')

let proxy = undefined

class Browser {
  constructor() {
    this.instance = undefined
    this.isLockBrowser = false
    this.pupOpts = {
      ignoreHTTPSErrors: true,
      headless: browserConfig.browserHeadlessMode,
      timeout: 30000,
      // pipe: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        // '--single-process',
        '--disable-gpu',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
        '--disable-dev-shm-usage',
        // '--start-fullscreen' // you can also use '--start-fullscreen' or '--start-maximized'
      ],
    }
  }

  async init() {
    logger.warn('init browser')

    if (proxy) {
      const proxyUrl = new URL(proxy)
      pupOpts['args'].push(`--proxy-server=${proxyUrl.origin}`)
    }

    this.instance = await puppeteer.launch(this.pupOpts)
    logger.info('browser is created')

    this.isLockBrowser = false

    this.instance.on('disconnected', async () => {
      logger.warn('browser is crashed')

      this.isLockBrowser = true

      logger.warn('recreated browser')

      await this.init()
    })
  }

  checkBrowser() {
    if (!this.instance || !this.instance.isConnected()) {
      return false
    }
    return true
  }

  async getNewPage() {
    if (!this.checkBrowser()) {
      logger.info('browser is not created')
      while (this.isLockBrowser) {
        logger.info('browser is locked, wait for unlock')
        await sleep(browserConfig.timeToWaitWhenBrowserIsLocked)
      }

      if (!this.checkBrowser()) {
        this.isLockBrowser = true

        await this.init()
      }
    }

    const page = await this.instance.newPage()

    await page.setUserAgent(browserConfig.userAgent)

    // const iPhone = puppeteer.devices['iPhone X']

    // await page.emulate(iPhone)
    if (proxy) {
      const proxyUrl = new URL(proxy)
      await page.authenticate({
        username: proxyUrl.username,
        password: proxyUrl.password,
      })
    }
    await page.setExtraHTTPHeaders({
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'ja,en-US;q=0.9,en;q=0.8,vi;q=0.7',
    })

    page.on('dialog', async (dialog) => {
      logger.warn('dialog is called::', dialog.message())
      await dialog.accept()
    })

    await page.setRequestInterception(true)
    page.on('request', (req) => {
      if (
        req.resourceType() == 'stylesheet' ||
        req.resourceType() == 'font' ||
        req.resourceType() == 'image'
        // false // uncomment for debug
      ) {
        req.abort()
      } else {
        req.continue()
      }
    })

    return page
  }

  async goto(url) {
    logger.info('goto url::', url)
    const page = await this.getNewPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

      await page.waitForSelector('html', {
        timeout: browserConfig.waitForHTMLSelectorTimeout,
      })

      await sleep(browserConfig.timeToWaitJS)

      const renderHTMLRet = await Promise.race([
        this.renderIframeToHtml(page),
        sleepWithReturnFlg(browserConfig.renderHTMLTimeout),
      ])

      if (renderHTMLRet.sleepFlg) {
        throw new Error('can not get html')
      }
      const html = renderHTMLRet

      const curUrl = page.url()

      // logger.info('close page::', url)
      await Promise.race([
        this.closePage(page),
        sleepWithReturnFlg(browserConfig.closePageTimeout),
      ])

      return { html, curUrl }
    } catch (error) {
      logger.error('goto url failed::', error.message, url)
      await sleep(browserConfig.timeToWaitBeforeClosePage) // wait for page close when page is not loaded, it is necessary

      const closePageRet = await Promise.race([
        this.closePage(page),
        sleepWithReturnFlg(browserConfig.closePageTimeout),
      ])

      // logger.info('page is closed::', url)
      if (closePageRet && closePageRet.sleepFlag) {
        logger.warn(
          `page can not close in ${browserConfig.closePageTimeout}, maybe destroy browser is called `,
          url,
        )

        await this.destroy()
      }
      return { error }
    }
  }

  async getLengthPages() {
    return (await this.instance.pages()).length
  }

  async getPages() {
    return await this.instance.pages()
  }

  async renderIframeToHtml(page) {
    const iframes = await page.$$('iframe, frame, object')

    for (const iframe of iframes) {
      const frame = await iframe.contentFrame()

      if (!frame) {
        continue
      }

      const frameUrl = frame.url()
      if (!frameUrl || frameUrl === 'about:blank') {
        continue
      }
      const context = await frame.executionContext()
      const res = await context.evaluate(() => {
        const el = document.querySelector('*')

        if (el) return el.outerHTML
      })

      if (res) {
        await iframe.evaluate((a, res) => {
          a.innerHTML = res
        }, res)
      }
    }

    const content = await page.content()
    // const content = await page.evaluate(() =>
    //   new XMLSerializer().serializeToString(document)
    // )

    return content
  }

  async destroy() {
    logger.warn('destroy browser')
    if (!this.instance) {
      logger.warn('browser is destroyed')
      return false
    }
    try {
      logger.info('close all pages')
      await this.instance.close()
      logger.info("browser's pages are closed")
    } catch (error) {
      logger.warn("can't close browser::", error)

      return null
    }
  }

  async closePage(page) {
    try {
      await page.close()
    } catch (error) {
      logger.warn("can't close page::", error)
    }
  }
}

module.exports = new Browser()
