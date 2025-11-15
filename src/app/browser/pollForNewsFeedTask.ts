import * as cheerio from "cheerio";
import { k } from "../globals";
import { Task } from "./task";
import { NewsFeedItem, NewsFeedTag } from "../data/newsFeed";

export class PollForNewsFeedTask extends Task {
  async execute(): Promise<NewsFeedItem[]> {
    await this.page.goto(
      new URL("/category/news-feed/", k.BASE_URL).toString()
    );

    const content = await this.page.content();
    const $ = cheerio.load(content);
    const ext = $.extract({
      posts: [
        {
          selector: ".site-main .co_posts_grid .post_single",
          value: {
            category: "data-category",
            title: ".right .h4 a",
            url: {
              selector: ".right .h4 a",
              value: "href",
            },
            date: ".right .co_date.hidden-desktop span",
            imgUrl: {
              selector: ".left img",
              value: "data-src",
            },
            tag: ".post-top.hidden-desktop .post-tag span",
          },
        },
      ],
    });

    try {
      return ext.posts.map((p) => ({
        id: p.url!.match(/\/([^\/]*\/[^\/]*)\/?$/)![1],
        tag: p.tag!.toLowerCase().replace(" ", "-") as NewsFeedTag,
        title: p.title!.trim(),
        date: new Date(p.date!),
        url: p.url!,
        imgUrl: p.imgUrl!,
      }));
    } catch {
      throw Error(
        `At least some required data was undefined or in the wrong format on ${this.page.url()}.`
      );
    }
  }
}
