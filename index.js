const browser = require('./browser')
const logger = require('./helpers/log')
const { sleep } = require('./helpers/utils')
const { accountConfig } = require('./config')

async function handler(username, password) {
  await browser.getNewPage()

  const pages = await browser.getPages()
  const page = pages[0]
  await page.bringToFront()

  const url =
    'https://shopee.vn/buyer/login?next=https%3A%2F%2Fshopee.vn%2Fshopee-coins'
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  await sleep(1000)

  await page.waitForSelector('input[name="loginKey"]', {
    timeout: 30000,
  })

  await sleep(1000)

  await page.focus('input[name="loginKey"]')
  await page.keyboard.type(username)

  await page.focus('input[name="password"]')
  await page.keyboard.type(password)

  await sleep('step')

  await page.click(
    'div#main > div > div:nth-child(3) > div > div > div > div:nth-child(2) > form > div > div:nth-child(2) > button',
  )

  await sleep('step')

  await page.waitForSelector('div#main', {
    timeout: 30000,
  })

  await sleep('step')

  let isSuccess = false
  for (let i = 0; i < 3; i++) {
    const isExist = await checkElementExist(page, 'button[data-inactive=false]')
    if (isExist) {
      await page.click('button[data-inactive=false]')
      isSuccess = true
      break
    }
    await sleep('step')
  }

  logger.info(`username:: ${username}, isSuccess:: ${isSuccess}`)

  await browser.destroy()
}

async function checkElementExist(page, selector) {
  const element = await page.$(selector)
  return !!element
}

async function main() {
  const { usernames, passwords } = accountConfig

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
