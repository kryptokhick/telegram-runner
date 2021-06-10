/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import * as dotenv from "dotenv";

const envFound = dotenv.config();

if (envFound.error)
  throw new Error("Couldn't find .env file or volumes in compose.");

const telegramToken = process.env.BOT_TOKEN;
const hubUrl = process.env.HUB_URL;
const prefix = process.env.PREFIX || "!";
const api = {
  prefix: "/api",
  port: process.env.PORT || 8990
};

if (!telegramToken)
  throw new Error("You need to specify the bot's BOT_TOKEN in the .env file.");

if (!hubUrl)
  throw new Error("You need to specify the HUB_URL in the .env file.");

export default {
  telegramToken,
  hubUrl,
  prefix,
  api
};
