import * as cheerio from "cheerio";
import { Task } from "./task";
import { NewsFeedItemContent } from "../data/newsFeed";

export class OpenNewsFeedTask extends Task {
  async execute(url: string): Promise<NewsFeedItemContent> {
    await this.page.goto(new URL(url).toString());

    const content = await this.page.content();
    const $ = cheerio.load(content);
    $(".post_single").remove();
    const ext = $.extract({
      content: ".site-main .entry-content",
    });
    
    try {
      return ext.content!.trim() as NewsFeedItemContent
    } catch {
      throw Error(
        `At least some required data was undefined or in the wrong format on ${this.page.url()}.`
      );
    }
  }
}
