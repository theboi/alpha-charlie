import { Page } from "playwright-core";

export abstract class Task {
  protected page: Page

  constructor(page: Page) {
    this.page = page
  }

  async execute() {}
}