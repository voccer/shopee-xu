import { chromium } from 'playwright'
import Config from './config'
import { BrowserContext, Page } from 'playwright-core'

export const createNewContext = async (userDir: string) => {
  const context = await chromium.launchPersistentContext(userDir, {
    timeout: 30000,
    headless: Config.browserConfig().headless
  })

  return context
}

export const createNewPage = async (context: BrowserContext) => {
  const page = await context.newPage()

  return page
}

export const closeContext = async (context: BrowserContext) => {
  if (context) await context.close()
}

export const closePage = async (page: Page) => {
  if (page) await page.close()
}
