import { NextRequest } from "next/server";
import { configDotenv } from "dotenv";
import { BrowserProvider } from "../browser/browserProvider";

configDotenv();
const isProduction = process.env.VERCEL_ENV === "production";

export async function GET(req: NextRequest) {
  console.log("GitHub Action pinged.");
  // const msg = (await req.json()).message;
  // const chatId = msg.chat.id;

  const browserProvider = BrowserProvider.getProvider();

  await browserProvider.readyBrowser();
  const mainPage = await browserProvider.context!.newPage();
  await mainPage.goto("https://bravosresearch.com");
  await mainPage.screenshot({ path: "./screenshot.png" });

  try {
    return new Response("OK", { status: 200 });
  } catch (e) {
    if (isProduction) throw e;
    // await bot.safeSendMessage(`*Unexpected error occurred*\n\n${parseMarkdownEscape(`${e instanceof Error ? e.message : e}`)}`, { parse_mode: "MarkdownV2" })
    return new Response(`Webhook error: ${e}`, {
      status: 200, // 200 because otherwise Telegram will keep pinging webhook non-stop until 200 is returned
    });
  } finally {
    browserProvider.closeBrowser();
  }
}
