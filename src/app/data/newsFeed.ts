export type NewsFeedTag = "trade_alert" | "premium_video"

export interface NewsFeedItem {
  id: string;
  tag: NewsFeedTag;
  title: string;
  date: Date;
  url: string;
  imgUrl: string;
}

export type NewsFeedItemContent = string