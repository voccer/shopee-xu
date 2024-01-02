import ppe from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { browserConfig } from "./config.mjs";
ppe.use(StealthPlugin());

export const newBrowser = async (userDir) => {
  const browser = await ppe.launch({
    headless: browserConfig.browserHeadlessMode,
    timeout: 30000,
    ignoreHTTPSErrors: true,
    userDataDir: userDir,
  });

  return browser;
};

export const newPage = async (browser) => {
  const page = await browser.newPage();
  // await page.setUserAgent(browserConfig.userAgent);

  // await page.setExtraHTTPHeaders({
  //   "accept-encoding": "gzip, deflate, br",
  //   "accept-language": "ja,en-US;q=0.9,en;q=0.8,vi;q=0.7",
  // });

  // page.on("dialog", async (dialog) => {
  //   logger.warn("dialog is called::", dialog.message());
  //   await dialog.accept();
  // });

  // await page.setRequestInterception(true);

  return page;
};

export const closeBrowser = async (browser) => {
  await browser.close();
};

export const closePage = async (page) => {
  await page.close();
};
