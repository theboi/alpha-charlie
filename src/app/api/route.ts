import { NextRequest } from "next/server";
import { configDotenv } from "dotenv";
import { BrowserProvider } from "../browser/browserProvider";
import { LoginTask } from "../browser/loginTask";
import { k } from "../globals";
import { PollForNewsFeedTask } from "../browser/pollForNewsFeedTask";
import { OpenNewsFeedTask } from "../browser/openNewsFeedTask";

configDotenv();

export async function GET(req: NextRequest) {
  console.log("GitHub Action pinged.");
  console.log(`Running in ${process.env.VERCEL_ENV ?? "development (local)"}.`)
  // const msg = (await req.json()).message;
  // const chatId = msg.chat.id;

  const browserProvider = BrowserProvider.getProvider();
  await browserProvider.readyBrowser();
  const ctx = await browserProvider.getContext();

  const mainPage = await ctx.newPage()
  await (new LoginTask(mainPage)).execute()
  const posts = await (new PollForNewsFeedTask(mainPage)).execute()
  console.log(posts)
  // const post = await (new OpenNewsFeedTask(mainPage)).execute("https://bravosresearch.com/news-feed/initiating-long-on-roku-inc-roku-breakout/")
  // console.log(post)

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
