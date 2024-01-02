import path from 'path'
import { fileURLToPath } from 'url'
import { closeBrowser, newBrowser, newPage } from './browser.mjs'

import { accountConfig } from './config.mjs'
import log from './helpers/log.mjs'
import { checkElementExist, sleep } from './helpers/utils.mjs'

const handler = async (username, password) => {
  console.log('🚀 ~ handler ~ username:', username)
  const userDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'data',
    'ig.insync' + username.split(' ').at(-1)
  )
  const browser = await newBrowser(userDir)
  const page = await newPage(browser)

  const xuUrl = 'https://shopee.vn/shopee-coins'
  await page.goto(xuUrl, { waitUntil: 'networkidle2', timeout: 30000 })
  await sleep(1000)
  // collect xu

  await page.waitForSelector('#main')

  log.info('collecting xu ...')
  for (let i = 0; i < 5; i++) {
    const isExist = await checkElementExist(page, 'button[data-inactive=false]')
    if (isExist) {
      await page.click('button[data-inactive=false]', { delay: 1000 })

      break
    }
    await sleep('step')
  }

  const attendanceUrl =
    'https://shopee.vn/buyer/login?from=https%3A%2F%2Fshopee.vn%2Fuser%2Fpurchase%2F%3Ftype%3D3&next=https%3A%2F%2Fshopee.vn%2Fuser%2Fpurchase%2F%3Ftype%3D3'

  await page.goto(attendanceUrl, { waitUntil: 'networkidle2', timeout: 30000 })

  await page.waitForSelector('div#main', {
    timeout: 30000,
  })

  await sleep('step')

  const candidateRateButtonElements = await page.$$('button.stardust-button')

  const rateButtonElements = []

  for (const candidateRateButtonElement of candidateRateButtonElements) {
    const text = (
      await candidateRateButtonElement.evaluate((node) => node.innerText)
    ).trim()

    if (text === 'Đánh Giá') {
      rateButtonElements.push(candidateRateButtonElement)
    }
  }

  for (const rateButtonElement of rateButtonElements) {
    await rateButtonElement.click()
    await sleep('step')
    await page.waitForSelector('div#modal', {
      timeout: 10000,
    })

    const textAreaElements = await page.$$('textarea')
    for (const textAreaElement of textAreaElements) {
      await textAreaElement.type(
        'Hàng đúng như mô tả, hàng còn mới, giao hàng nhanh chóng, shop nhiệt tình, ủng hộ.',
        { delay: 50 }
      )
      break
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const filePaths = [
      path.join(__dirname, 'data', 'image.jpeg'),
      path.join(__dirname, 'data', 'image_2.jpeg'),
    ]

    for (const filePath of filePaths) {
      const fileElements = await page.$$('input[type=file]')
      for (const fileElement of fileElements) {
        await fileElement.uploadFile(filePath)
        await sleep('step')
      }
    }

    const showNameCheckboxElements = await page.$$('input[type=checkbox]')
    for (const showNameCheckboxElement of showNameCheckboxElements) {
      await showNameCheckboxElement.click()
    }

    await sleep('step')

    const completeButtonElements = []
    const candidateCompleteButtonElements = await page.$$('button[type=button]')
    for (const candidateCompleteButtonElement of candidateCompleteButtonElements) {
      const text = (
        await candidateCompleteButtonElement.evaluate((node) => node.innerText)
      ).trim()

      if (text.toLowerCase() === 'hoàn thành') {
        completeButtonElements.push(candidateCompleteButtonElement)
      }
    }

    for (const completeButtonElement of completeButtonElements) {
      await completeButtonElement.click()
      await sleep('step')
    }

    await sleep('step')
  }

  await closeBrowser(browser)
}

const main = async () => {
  const { usernames, passwords } = accountConfig

  const usernameList = usernames.split(';')
  const passwordList = passwords.split(';')

  for (let i = 1; i < usernameList.length; i++) {
    const username = usernameList[i]
    const password = passwordList[i]
    await handler(username, password)
  }

  process.exit(0)
}
main()
