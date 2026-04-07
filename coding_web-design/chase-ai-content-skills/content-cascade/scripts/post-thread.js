#!/usr/bin/env node
// Posts a Twitter/X thread from a file and optionally appends a YouTube link as a final reply.
// Usage: node post-thread.js <thread-file> [youtube-url]
//
// Reads Twitter API creds from ChaseAIWeb/.env.local

const path = require("path");
const fs = require("fs");

const WEB_DIR = process.env.CHASE_WEB_DIR || "C:/Users/Chase/ChaseAIWeb";

// Load .env.local manually
const envPath = path.join(WEB_DIR, ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  const val = trimmed.slice(eqIndex + 1);
  if (!process.env[key]) process.env[key] = val;
}

const { TwitterApi } = require(path.join(WEB_DIR, "node_modules", "twitter-api-v2"));

const threadFile = process.argv[2];
const youtubeUrl = process.argv[3];

if (!threadFile) {
  console.error("Usage: node post-thread.js <thread-file> [youtube-url]");
  process.exit(1);
}

function parseTweets(content) {
  // Split on numbered tweet markers (1/, 2/, etc.) at the start of a line
  const parts = content.split(/(?:^|\n)(?=\d+\/\s)/);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((block) => block.replace(/^\d+\/\s*/, "").trim());
}

async function main() {
  const content = fs.readFileSync(threadFile, "utf8");
  const tweets = parseTweets(content);

  if (tweets.length === 0) {
    console.error("No tweets found in file");
    process.exit(1);
  }

  const twitter = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  console.log(`Posting thread (${tweets.length} tweets)...`);

  // Post first tweet
  const first = await twitter.v2.tweet(tweets[0]);
  let lastTweetId = first.data.id;
  console.log(`  1/${tweets.length} posted`);

  // Chain replies
  for (let i = 1; i < tweets.length; i++) {
    const reply = await twitter.v2.reply(tweets[i], lastTweetId);
    lastTweetId = reply.data.id;
    console.log(`  ${i + 1}/${tweets.length} posted`);
  }

  // Append YouTube link as final self-reply
  if (youtubeUrl) {
    await twitter.v2.reply(`Watch the full video \u{1F447}\n${youtubeUrl}`, lastTweetId);
    console.log("  Video link reply posted");
  }

  const me = await twitter.v2.me();
  const url = `https://x.com/${me.data.username}/status/${first.data.id}`;
  console.log(`\nThread live: ${url}`);
}

main().catch((err) => {
  console.error("Failed to post thread:", err.message);
  process.exit(1);
});
