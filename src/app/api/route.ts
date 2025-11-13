import { NextRequest } from "next/server";
import { configDotenv } from "dotenv";
import { BrowserProvider } from "../browser/browserProvider";
import { Redis } from '@upstash/redis'
import { LoginTask } from "../browser/loginTask";
import { k } from "../globals";

configDotenv();
const redis = Redis.fromEnv();

export async function GET(req: NextRequest) {
  console.log("GitHub Action pinged.");
  console.log(`Running in ${process.env.VERCEL_ENV}.`)
  // const msg = (await req.json()).message;
  // const chatId = msg.chat.id;

  const browserProvider = BrowserProvider.getProvider();
  await browserProvider.readyBrowser();
  const ctx = await browserProvider.getContext();

  const mainPage = await ctx.newPage()
  const login = new LoginTask(mainPage)
  await login.execute()
  
  try {
    return new Response("OK", { status: 200 });
  } catch (e) {
    if (k.IS_PRODUCTION_OR_PREVIEW) throw e;
    // await bot.safeSendMessage(`*Unexpected error occurred*\n\n${parseMarkdownEscape(`${e instanceof Error ? e.message : e}`)}`, { parse_mode: "MarkdownV2" })
    return new Response(`Webhook error: ${e}`, {
      status: 200, // 200 because otherwise Telegram will keep pinging webhook non-stop until 200 is returned
    });
  } finally {
    browserProvider.closeBrowser();
  }
}
