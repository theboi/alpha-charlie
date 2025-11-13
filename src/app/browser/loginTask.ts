import { k } from "../globals";
import { Task } from "./task";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export class LoginTask extends Task {
  async execute(): Promise<void> {
    const ctx = this.page.context()

    const loggedInKey = (await redis.keys("wordpress_logged_in*"))[0]
    const secKey = (await redis.keys("wordpress_sec*"))[0]

    // Case 1: Saved cookies present in Redis
    if (!!loggedInKey && !!secKey) {
      console.log("Redis cookies persisted.")
      await ctx.addCookies([
        { name: loggedInKey, value: String(redis.get(loggedInKey)), url: k.BASE_URL },
        { name: secKey, value: String(redis.get(secKey)), url: k.BASE_URL }
      ])
      return
    }
    
    // 2) No saved cookies
    console.log("Refreshing cookies and persisting in Redis.")
    const loginUrl = new URL('/my-account/edit-account/', k.BASE_URL).toString()
    await this.page.goto(loginUrl)
    await this.page.screenshot({ path: `${k.CWD_PATH}/screenshot.png` });

    const username = process.env.WP_USERNAME
    const password = process.env.WP_PASSWORD
    if (!username || !password) throw Error("Environment variables for username and password not set.")

    // Fill and submit the standard WP login form. Adjust selectors if customized.
    await this.page.locator('.entry-content #username').fill(username)
    await this.page.locator('.entry-content #password').fill(password)
    await this.page.locator('.entry-content #rememberme').check()
    await this.page.locator('.entry-content [type=submit]').click()

    // Wait for logged-in state (network idle as a basic heuristic)
    await this.page.waitForLoadState("load")

    await this.page.screenshot({ path: `${k.CWD_PATH}/screenshot.png` });

    // collect cookies and persist wordpress_* cookies to Redis
    const cookies = await ctx.cookies()
    const wpCookies = cookies.filter(c => c.name.startsWith('wordpress_logged_in') || c.name.startsWith('wordpress_sec'))

    for (const c of wpCookies) {
      const key = c.name
      const value = c.value
      if (c.expires && c.expires > 0) {
        const expiresAt = c.expires // Playwright exposes expires as seconds since epoch
        const nowSec = Math.floor(Date.now() / 1000)
        const ttl = Math.max(0, Math.floor(expiresAt - nowSec))
        if (ttl > 0) {
          await redis.set(key, value, { ex: ttl })
          continue
        }
      }
    }

    return
  }
}