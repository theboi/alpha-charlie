import { BrowserContext, chromium, ChromiumBrowser } from "playwright-core";
import chromiumBinary from "@sparticuz/chromium";
import topUserAgents from "top-user-agents";

const isProductionOrPreview = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";

export class BrowserProvider {
  private static provider: BrowserProvider

  static getProvider() {
    if (this.provider === undefined) {
      this.provider = new BrowserProvider
    }
    return this.provider
  }

  private constructor() {}

  private browser?: ChromiumBrowser;
  context?: BrowserContext;

  async readyBrowser() {
    console.log("Readying Browser...")
    if (!this.browser || !this.context) {  
      this.browser = await chromium.launch({
        executablePath: isProductionOrPreview ? await chromiumBinary.executablePath() : process.env.CHROME_EXECUTABLE_PATH,
        headless: true, //isProduction,
        args: isProductionOrPreview ? chromiumBinary.args : ["--start-maximized"],
      });
      this.context = await this.browser.newContext({
        viewport: {
          width: 1920,
          height: 1080,
        },
        userAgent:
          topUserAgents[0] ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      });
    }
  }

  async closeBrowser() {
    console.log("Closing Browser...")
    await this.browser?.close()
  }
}