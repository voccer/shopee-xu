import ppe from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";

ppe.use(StealthPlugin());

import { config } from "dotenv";
config()

const USERNAME = process.env.MAIL_USERNAME;
const PASSWORD = process.env.MAIL_PASSWORD;

const headless = false; //"new"; // "new" or true or false

const googleAccountUrl =
  "https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fwww.google.com.tw%2F%3Fpli%3D1&ec=GAZAmgQ&hl=vi&ifkv=AYZoVhckihWhmjwBUiuM4iwyEBi4pcQzTh4Vz2e6hILHJqLs0hmXi8e_gSFiWjLcwEXwb_c6MTesyA&passive=true&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S117986926%3A1696876353379315&theme=glif";

async function getVerifyCode(recoveryEmail) {
  const browser = await ppe.launch({
    headless,
    args: [
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],

    ignoreDefaultArgs: ["--disable-component-extensions-with-background-pages"],
  });

  try {
    const page = await browser.newPage();

    await page.goto(googleAccountUrl);

    // login
    const gmail = USERNAME;
    await page.type("#identifierId", gmail, {
      delay: 100,
    });
    await page.click("#identifierNext");
    await page.waitForSelector("input[type='password']");
    await sleep(2500);
    await page.type('input[type="password"]', PASSWORD, {
      delay: 200,
    });
    await page.click("#passwordNext");
    await page.waitForSelector("html");
    await sleep(5000);
    await page.goto("https://mail.google.com/mail/");
    await page.waitForSelector("html");
    await sleep(4000);

    const elements = await page.$$("table > tbody > tr");

    let verifyCode = undefined;
    for (const ele of elements) {
      const content = await ele.evaluate((el) => el.textContent);
      if (
        content.includes("Mã xác minh cho email khôi phục:") &&
        content.includes(recoveryEmail)
      ) {
        verifyCode = content
          .split("Mã xác minh cho email khôi phục:")[1]
          .slice(0, 8)
          .replace(" ", "")
          .replace(",", "");
        break;
      }
    }

    await browser.close();

    return verifyCode;
  } catch (e) {
    console.log(e);
    await browser.close();
  }
}

export default getVerifyCode;