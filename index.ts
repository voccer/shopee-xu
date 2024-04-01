import path from 'path'
import { fileURLToPath } from 'url'
import { closeContext, createNewContext, createNewPage } from './browser'

import Config from './config'
import logger from './helpers/logger'
import { sleep } from './helpers/utils'
import { BrowserContext } from 'playwright'

const checkLogin = async (
  context: BrowserContext,
  username: string,
  password: string
) => {
  let page = undefined
  try {
    const page = await createNewPage(context)

    const loginUrl = 'https://shopee.vn'
    await page.goto(loginUrl)

    let needLogin = false
    for (let i = 0; i < 10; i++) {
      const pageUrl = page.url()
      if (pageUrl.includes('login')) {
        needLogin = true
        break
      }
      await sleep(1500)
    }

    logger.info('needLogin', needLogin)

    if (!needLogin) {
      return logger.info("Don't need login")
    }
    const usernameLocator = page.locator('input[name="loginKey"]')
    await usernameLocator.pressSequentially(username, {
      delay: 100
    })

    await sleep(2000)
    const passwordLocator = page.locator('input[name="password"]')

    await passwordLocator.pressSequentially(password, {
      delay: 100
    })

    await sleep(2000)

    await passwordLocator.press('Enter')

    let needVerify = false
    while (true) {
      const pageUrl = page.url()
      if (pageUrl.includes('verify')) {
        needVerify = true
        break
      }

      await sleep(1500)
    }

    await sleep(5000)

    if (needVerify) {
      logger.info('needVerify', needVerify)

      const verifyButtonLocators = await page.locator('button').all()
      for (const verifyButtonLocator of verifyButtonLocators) {
        const text = (await verifyButtonLocator.innerText())
          .trim()
          .toLowerCase()
        if (text.includes('xác minh bằng liên kết email')) {
          await verifyButtonLocator.click({ delay: 1000, force: true })
          break
        }
      }
    }

    while (true) {
      const pageUrl = page.url()
      if (pageUrl.includes('true') && !pageUrl.includes('verify')) {
        logger.info('Login success')
        break
      }

      await sleep(1500)
    }
  } catch (e) {
    logger.error(e)
  } finally {
    if (page) {
      await page.close()
    }
  }
}

const collectCoin = async (context: BrowserContext) => {
  let page = undefined
  try {
    const page = await createNewPage(context)

    const coinUrl = 'https://shopee.vn/shopee-coins'
    await page.goto(coinUrl)

    await page.waitForSelector('#main', {
      timeout: 30000
    })

    for (let i = 0; i < 10; i++) {
      const getCoinLocators = await page
        .locator('button[data-inactive=false]')
        .all()

      if (getCoinLocators.length > 0) {
        await getCoinLocators[0].click({ delay: 1000, force: true })

        break
      }
      await sleep(1000)
    }
  } catch (e) {
    logger.error(e)
  } finally {
    if (page) {
      await page.close()
    }
  }
}

const handler = async (username: string, password: string) => {
  const userDir = path.join(
    __dirname,
    'data',
    'ig.insync' + username.split(' ').at(-1)
  )
  const context = await createNewContext(userDir)
  await checkLogin(context, username, password)

  await collectCoin(context)

  await sleep(5000)
  await closeContext(context)

  // const coinUrl = 'https://shopee.vn/shopee-coins'
  // await page.goto(coinUrl)

  // await page.waitForSelector('#main', {
  //   timeout: 30000
  // })

  // for (let i = 0; i < 10; i++) {
  //   const getCoinLocators = await page.locator
  //   if (isExist) {
  //     await page.click('button[data-inactive=false]', { delay: 1000 })

  //     break
  //   }
  //   await sleep('step')
  // }

  // const attendanceUrl =
  //   'https://shopee.vn/buyer/login?from=https%3A%2F%2Fshopee.vn%2Fuser%2Fpurchase%2F%3Ftype%3D3&next=https%3A%2F%2Fshopee.vn%2Fuser%2Fpurchase%2F%3Ftype%3D3'

  // await page.goto(attendanceUrl, { waitUntil: 'networkidle2', timeout: 30000 })

  // await page.waitForSelector('div#main', {
  //   timeout: 30000
  // })

  // await sleep('step')

  // const candidateRateButtonElements = await page.$$('button.stardust-button')

  // const rateButtonElements = []

  // for (const candidateRateButtonElement of candidateRateButtonElements) {
  //   const text = (
  //     await candidateRateButtonElement.evaluate((node) => node.innerText)
  //   ).trim()

  //   if (text === 'Đánh Giá') {
  //     rateButtonElements.push(candidateRateButtonElement)
  //   }
  // }

  // for (const rateButtonElement of rateButtonElements) {
  //   await rateButtonElement.click()
  //   await sleep('step')
  //   await page.waitForSelector('div#modal', {
  //     timeout: 10000
  //   })

  //   const textAreaElements = await page.$$('textarea')
  //   for (const textAreaElement of textAreaElements) {
  //     await textAreaElement.type(
  //       'Hàng đúng như mô tả, hàng còn mới, giao hàng nhanh chóng, shop nhiệt tình, ủng hộ.',
  //       { delay: 50 }
  //     )
  //     break
  //   }

  //   const __dirname = path.dirname(fileURLToPath(import.meta.url))
  //   const filePaths = [
  //     path.join(__dirname, 'data', 'image.jpeg'),
  //     path.join(__dirname, 'data', 'image_2.jpeg')
  //   ]

  //   for (const filePath of filePaths) {
  //     const fileElements = await page.$$('input[type=file]')
  //     for (const fileElement of fileElements) {
  //       await fileElement.uploadFile(filePath)
  //       await sleep('step')
  //     }
  //   }

  //   const showNameCheckboxElements = await page.$$('input[type=checkbox]')
  //   for (const showNameCheckboxElement of showNameCheckboxElements) {
  //     await showNameCheckboxElement.click()
  //   }

  //   await sleep('step')

  //   const completeButtonElements = []
  //   const candidateCompleteButtonElements = await page.$$('button[type=button]')
  //   for (const candidateCompleteButtonElement of candidateCompleteButtonElements) {
  //     const text = (
  //       await candidateCompleteButtonElement.evaluate((node) => node.innerText)
  //     ).trim()

  //     if (text.toLowerCase() === 'hoàn thành') {
  //       completeButtonElements.push(candidateCompleteButtonElement)
  //     }
  //   }

  //   for (const completeButtonElement of completeButtonElements) {
  //     await completeButtonElement.click()
  //     await sleep('step')
  //   }

  //   await sleep('step')
  // }

  // await closeBrowser(browser)
}

const main = async () => {
  const { usernames, passwords } = Config.accountConfig()

  const usernameList = usernames.split(';')
  const passwordList = passwords.split(';')

  for (let i = 0; i < usernameList.length; i++) {
    const username = usernameList[i]
    const password = passwordList[i]
    await handler(username, password)
  }

  process.exit(0)
}
main()
