/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import * as dotenv from "dotenv";

interface Api {
  prefix: string;
  port: string | number;
}

export default class Config {
  private static _botToken: string;

  private static _hubUrl: string;

  private static _api: Api;

  static get botToken(): string {
    return this._botToken;
  }

  static get hubUrl(): string {
    return this._hubUrl;
  }

  static get api(): Api {
    return this._api;
  }

  static setup(): void {
    if (dotenv.config().error)
      throw new Error("Couldn't find .env file in compose.");

    this._botToken = process.env.BOT_TOKEN as string;

    if (!this._botToken)
      throw new Error("You need to specify BOT_TOKEN in the .env file.");

    this._hubUrl = process.env.HUB_URL as string;

    if (!this._hubUrl)
      throw new Error("You need to specify HUB_URL in the .env file.");

    this._api = {
      prefix: "/api",
      port: process.env.PORT || 8990
    };
  }
}
