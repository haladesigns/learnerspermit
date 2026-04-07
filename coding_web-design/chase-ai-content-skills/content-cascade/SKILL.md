---
name: content-cascade
description: "Generate blog post, Twitter thread, and LinkedIn post from a YouTube video. Fetches transcript, generates all three content pieces following Chase AI's voice/style guidelines, and saves as drafts to Supabase. Trigger on phrases like 'generate content for this video', 'content cascade for', 'write a blog post from my video', 'create content from YouTube', 'run content cascade on my latest video', or any request to turn a YouTube video into blog/social content."
---

# Content Cascade

Turn a YouTube video into a full content cascade: blog post + Twitter thread + LinkedIn post. Fetches the transcript, generates all three pieces following Chase AI's voice guidelines, and saves everything as drafts to Supabase.

## When This Skill Activates

**Activate when the user wants to:**
- Generate blog/social content from a YouTube video
- Create a content cascade from a video they just published
- Write a blog post, Twitter thread, or LinkedIn post from a video transcript
- Run the content pipeline for a new video
- Run the content cascade on their latest video

**Example triggers:**
- "Run the content cascade on my latest video"
- "Content cascade for my latest video"
- "Generate content for https://youtube.com/watch?v=XYZ"
- "Create blog + twitter + linkedin for [URL]"
- `/content-cascade`
- `/content-cascade [URL]`

## Pipeline Steps

### Step 1 — Get the Video

**If the user provided a YouTube URL**, use it.

**If the user said "latest video" or didn't provide a URL**, auto-detect the most recent upload from Chase's channel:

```bash
yt-dlp --flat-playlist --playlist-end 1 --print url --print title "https://www.youtube.com/channel/UCoy6cTJ7Tg0dqS-DI-_REsA/videos"
```

This returns the URL on the first line and the title on the second line. Confirm with the user: "Found your latest video: [TITLE]. Running the cascade on this one."

### Step 2 — Fetch Transcript

Try these methods in order. If a method fails, move to the next one.

**Method 1 — Apify (most reliable, especially for fresh uploads):**
```bash
node "C:/Users/Chase/.claude/skills/content-cascade/scripts/fetch-transcript-apify.js" "<youtube-url>"
```
This uses the `karamelo~youtube-transcripts` Apify actor with proxy support and up to 8 retries. It renders the YouTube page like a browser, so it works even when yt-dlp's API endpoints return stale/wrong captions. Note: this is a synchronous call that may take 30-60 seconds to complete.

**Method 2 — youtube-transcript (free):**
```bash
node "C:/Users/Chase/.claude/skills/content-cascade/scripts/fetch-transcript.js" "<youtube-url>"
```

**Method 3 — yt-dlp subtitles with original track (free):**

Try `en-orig` first (original uploaded captions), then fall back to `en` (auto-generated). **WARNING:** The `en` auto-generated track sometimes returns wrong transcripts, especially for recently uploaded videos. If using this method, sanity-check the first few sentences against the video title to make sure it's the right transcript.

```bash
yt-dlp --write-sub --sub-lang en-orig --skip-download --sub-format json3 -o "$TEMP/yt-transcript" "<youtube-url>"
```

If `en-orig` isn't available, fall back to auto-generated:
```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format json3 -o "$TEMP/yt-transcript" "<youtube-url>"
```

Then parse the json3 file with Node.js (python3 is not available on this system):
```bash
node -e "
const fs = require('fs');
const path = require('path');
const dir = process.env.TEMP;
const file = fs.readdirSync(dir).find(f => f.startsWith('yt-transcript') && f.endsWith('.json3'));
if (!file) { console.error('No subtitle file found'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const text = data.events.filter(e => e.segs).map(e => e.segs.map(s => s.utf8 || '').join('')).join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
console.log(text);
"
```

**IMPORTANT — Transcript Validation:** After fetching the transcript with ANY method, sanity-check the first 1-2 sentences against the video title. If the transcript content clearly doesn't match the video topic (e.g., video is about Claude Code but transcript talks about AI video generation), the transcript is wrong. Discard it and try the next method. If all methods return wrong/no transcripts, tell the user.

**If all methods fail**, captions probably aren't available yet. Tell the user:
> "Captions aren't available for this video yet — YouTube can take 30-60 minutes to generate them after upload. Try running the cascade again in a bit."

Do NOT proceed without a transcript. Stop here.

### Step 3 — Extract Video Metadata

Extract from the URL or yt-dlp output:
- **Video ID** — the 11-character ID
- **Video Title** — from Step 1 auto-detect, or fetch it:
```bash
yt-dlp --get-title "<youtube-url>"
```

### Step 3.5 — Classify Video Type

Based on the transcript content, classify the video as either **tutorial** or **discussion**.

**Tutorial signals** (→ generates guide + lead magnet LinkedIn post):
- Step-by-step instructions, processes, or workflows ("first... then... next...")
- How-to framing ("how to set up...", "how to build...", "let me show you...")
- Tool setup, configuration, installation, or code demos
- The viewer is expected to follow along or replicate something
- Clear actionable takeaways that map to a reference guide

**Discussion signals** (→ regular LinkedIn post only, NO guide):
- Opinions, predictions, reactions, or commentary ("I think...", "My take on...")
- Industry news, trend analysis, or comparisons
- Philosophical/strategic content without clear step-by-step actions
- Interviews, Q&A, or conversational formats
- The viewer is consuming perspective, not learning a process

**This classification should be obvious from the transcript.** If the video is teaching someone how to do something → tutorial. If it's sharing thoughts about a topic → discussion.

Tell the user which type was detected: "Detected as **tutorial** — will generate guide + lead magnet LinkedIn post." or "Detected as **discussion** — will generate regular LinkedIn post only (no guide)."

If the user disagrees, let them override.

### Step 4 — Generate Blog Post

Read the blog system prompt:
```
Read file: C:/Users/Chase/ChaseAIWeb/prompts/blog-system-prompt.md
```

Then generate the blog post by following ALL the guidelines in that prompt. The transcript is your source material. You ARE the writer — follow the voice, structure, and optimization rules exactly.

**IMPORTANT:** If the transcript mentions product names, tools, or versions you're not confident about, use WebSearch to verify before writing. The transcript is the source of truth for entity names.

**Generate these fields:**
- `meta_title` — under 60 chars with primary keyword
- `meta_description` — 150-160 chars with keyword and CTA
- `primary_keyword` — main keyword from the content
- `secondary_keywords` — 3-5 related terms
- `slug` — lowercase-hyphenated, under 60 chars
- `excerpt` — 1-2 sentence summary for preview cards
- `tags` — 3-7 topic tags
- `cover_image` — always use the YouTube thumbnail: `https://i.ytimg.com/vi/VIDEO_ID_HERE/maxresdefault.jpg`
- `content` — the full blog post in markdown (1,500-2,500 words)
- `review_notes` — what was cut from the transcript and any [STAT NEEDED] flags

**Show the user the generated blog post** for review before saving. Display the title, excerpt, and full content.

### Step 4.5 — Check for Existing Blog Post

Before saving, check if a blog post already exists for this video using the Supabase REST API:

```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/posts?youtube_video_id=eq.VIDEO_ID_HERE&select=id" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

- **If the response contains an id**, skip the blog insert. Use the returned `id` as `post_id` for the social content steps. Tell the user: "A blog post already exists for this video (post ID: X). Skipping blog creation — using the existing post for social content."
- **If the response is `[]`**, proceed with the insert below.

### Step 5 — Save Blog to Supabase

After the user approves (or immediately if they said to do everything), save the blog post using the Supabase REST API.

**Step 5a — Write JSON payload to a temp file** (avoids shell escaping issues with markdown content):
```bash
# Write the JSON payload to a temp file using the Write tool, then POST it:
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/posts" \
  -X POST \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d @"C:/Users/Chase/The Vault/content/temp/blog-payload.json"
```

The JSON payload file should contain:
```json
{
  "title": "TITLE_HERE",
  "slug": "SLUG_HERE",
  "excerpt": "EXCERPT_HERE",
  "content": "FULL_MARKDOWN_CONTENT_HERE",
  "cover_image": "https://i.ytimg.com/vi/VIDEO_ID_HERE/maxresdefault.jpg",
  "tags": ["tag1", "tag2", "tag3"],
  "published": false,
  "youtube_video_id": "VIDEO_ID_HERE",
  "meta_title": "META_TITLE_HERE",
  "meta_description": "META_DESC_HERE"
}
```

Use the Write tool to create the JSON file — this properly handles all special characters in the blog content without shell escaping issues. Extract the `id` from the response for use as `post_id` in social content steps.

**Step 5b — Publish the blog (optional):**
After saving as draft, ask the user: "Want me to publish this to the website now, or leave it as a draft?"

If the user wants to publish:
```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/posts?id=eq.POST_ID_HERE" \
  -X PATCH \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"published": true, "published_at": "CURRENT_ISO_TIMESTAMP"}'
```

Generate the ISO timestamp with: `date -u +"%Y-%m-%dT%H:%M:%S+00:00"`

### Step 6 — Generate Twitter Thread

Read the Twitter system prompt:
```
Read file: C:/Users/Chase/ChaseAIWeb/prompts/twitter-system-prompt.md
```

Generate a Twitter thread following ALL the guidelines. Use the transcript as source material. The thread should pick the single best angle from the video, not try to summarize everything.

**Show the thread to the user** before saving.

### Step 7 — Save Twitter Thread to Supabase

Write the JSON payload to a temp file, then POST via REST API:

```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/social_content" \
  -X POST \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d @"C:/Users/Chase/The Vault/content/temp/twitter-payload.json"
```

The JSON payload file should contain:
```json
{
  "post_id": "POST_ID_FROM_STEP_5",
  "platform": "twitter",
  "content": "THREAD_CONTENT_HERE",
  "status": "draft"
}
```

### Step 7.5 — Post Twitter Thread (Optional)

After the user approves the thread, ask: "Want me to post this to X now, or just save the draft?"

**If the user wants to post:**

1. Write the thread content to a temp file. **CRITICAL FORMAT:** Each tweet MUST start with its number followed by a forward slash (e.g., `1/`, `2/`, `3/`). The `post-thread.js` script splits tweets on these markers — without them, the entire thread posts as a single tweet.
```bash
cat > "$TEMP/thread.txt" << 'THREAD_EOF'
1/ First tweet content here

2/ Second tweet content here

3/ Third tweet content here
THREAD_EOF
```

2. Run the posting script:
```bash
node "C:/Users/Chase/.claude/skills/content-cascade/scripts/post-thread.js" "$TEMP/thread.txt" "https://youtu.be/VIDEO_ID_HERE"
```

The script reads Twitter API creds from `C:/Users/Chase/ChaseAIWeb/.env.local`, posts the thread as chained replies, and appends the YouTube link as a final self-reply. It prints the live thread URL when done.

3. Update the Supabase record to published:
```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/social_content?id=eq.SOCIAL_CONTENT_ID" \
  -X PATCH \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "published", "published_at": "CURRENT_ISO_TIMESTAMP", "updated_at": "CURRENT_ISO_TIMESTAMP"}'
```

4. Report the live thread URL to the user.

### Step 8 — Generate LinkedIn Post (Regular)

Read the LinkedIn system prompt:
```
Read file: C:/Users/Chase/ChaseAIWeb/prompts/linkedin-system-prompt.md
```

Generate a LinkedIn post following ALL the guidelines. Use the transcript as source material. Mirror the video's full premise — don't cherry-pick one sub-point.

**Every LinkedIn post MUST end with this CTA block followed by the video link:**

```
If you want access to [RELEVANT OFFER]:

1️⃣ Connect with me
2️⃣ Comment "agent"

Link to the full video breakdown is in the comments.

🔗 Full video: <youtube-url>
```

The `[RELEVANT OFFER]` should match the video content. Examples:
- "more Claude Code guides" (most common — use this as the default for Claude Code content)
- "the exact prompts I used"
- "the full automation workflow"
- "the step-by-step setup guide"

Pick whichever fits the video naturally. The keyword is ALWAYS "agent" — never change it.

**Show the post to the user** labeled as **"LINKEDIN (REGULAR)"** before saving.

### Step 8b — Generate LinkedIn Lead Magnet Post (TUTORIAL VIDEOS ONLY)

**Skip this step entirely if the video was classified as "discussion" in Step 3.5.**

Read the lead magnet LinkedIn system prompt:
```
Read file: C:/Users/Chase/ChaseAIWeb/prompts/linkedin-lead-magnet-system-prompt.md
```

Generate a **lead magnet** LinkedIn post following ALL the guidelines in that prompt. The post uses a "Steal my [playbook/roadmap/toolkit] for [outcome]" hook and focuses on **outcomes** the reader will get, NOT a table of contents of what's in the guide.

Key principles:
- **Hook line is everything.** "Steal my X for Y" — the first ~150 characters must promise something specific and valuable.
- **Body sells outcomes, not process.** "After this playbook you'll be able to..." NOT "Here's what the guide covers: step 1, step 2..."
- **Scarcity/exclusivity when applicable.** If the video covers something new, unreleased, or hard to find, lean into that.
- **Keep it tight.** 800-1500 characters total. No padding.
- **CTA: comment "agent"** to get the resource.

**LinkedIn image:** Use the YouTube thumbnail (`https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`). Tell the user: "Use your YouTube thumbnail as the LinkedIn post image."

**Show the post to the user** labeled as **"LINKEDIN (LEAD MAGNET)"** so they can compare both versions.

**After showing BOTH posts, ask the user which version to copy to clipboard.** Then copy the selected one using PowerShell:
```bash
powershell -Command "Set-Clipboard -Value 'SELECTED_LINKEDIN_POST_TEXT_HERE'"
```
Escape single quotes by doubling them (`'` becomes `''`) and wrap double quotes with backslash (`"` becomes `\"`). After copying, tell the user: "Copied to your clipboard — paste straight into LinkedIn."

### Step 8c — Generate Skool Guide as HTML (TUTORIAL VIDEOS ONLY)

**Skip this step entirely if the video was classified as "discussion" in Step 3.5.**

Read the guide system prompt:
```
Read file: C:/Users/Chase/ChaseAIWeb/prompts/guide-system-prompt.md
```

Generate a **Skool-ready guide** following ALL the guidelines in that prompt. Use the transcript as source material. Fill in gaps where the video showed things visually that a reader would need spelled out (setup steps, commands, config details).

The guide should be a standalone reference document — someone should be able to use it without watching the video, but it should make them want to watch the video and join the community.

**CRITICAL: Output the guide as an HTML file**, not markdown. Skool preserves HTML formatting when pasted, but plain markdown doesn't render well. Use the same HTML structure as the masterclass modules in `C:/Users/Chase/ChaseAIWeb/masterclass-modules/html/`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GUIDE_TITLE_HERE</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.7; color: #1a1a1a; }
  h1 { font-size: 28px; margin-top: 40px; }
  h2 { font-size: 22px; margin-top: 36px; }
  h3 { font-size: 18px; margin-top: 28px; }
  a { color: #0066cc; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 6px; }
  strong { font-weight: 600; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
</style>
</head>
<body>
<!-- GUIDE CONTENT HERE using h1, h2, h3, p, ul, ol, li, strong, code, pre tags -->
</body>
</html>
```

**Show the guide to the user** labeled as **"SKOOL GUIDE"** before saving.

After user approval, save the HTML guide to `C:/Users/Chase/The Vault/content/guides/SLUG-guide.html`.

Also save a vault-friendly markdown version to `C:/Users/Chase/The Vault/content/guides/SLUG-guide.md` with frontmatter:
```markdown
---
title: "GUIDE_TITLE_HERE"
date: YYYY-MM-DD
youtube_video_id: VIDEO_ID_HERE
supabase_post_id: POST_ID_HERE
type: skool_guide
status: draft
---

GUIDE CONTENT HERE (markdown version)
```

Tell the user: "HTML guide saved — open `content/guides/SLUG-guide.html` in a browser, select all, and paste into your Skool 'Free Guides' module. The formatting will carry over."

### Step 9 — Save LinkedIn Posts to Supabase

Save **both** LinkedIn post versions to Supabase.

**Regular LinkedIn post:**
```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/social_content" \
  -X POST \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d @"C:/Users/Chase/The Vault/content/temp/linkedin-payload.json"
```

```json
{
  "post_id": "POST_ID_FROM_STEP_5",
  "platform": "linkedin",
  "content": "REGULAR_LINKEDIN_CONTENT_HERE",
  "status": "draft"
}
```

**Lead magnet LinkedIn post (TUTORIAL VIDEOS ONLY — skip if discussion):**
```bash
curl -s "https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/social_content" \
  -X POST \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d @"C:/Users/Chase/The Vault/content/temp/linkedin-lead-magnet-payload.json"
```

```json
{
  "post_id": "POST_ID_FROM_STEP_5",
  "platform": "linkedin_lead_magnet",
  "content": "LEAD_MAGNET_LINKEDIN_CONTENT_HERE",
  "status": "draft"
}
```

### Step 10 — Save to Vault

Save a local copy of each generated piece to the Vault for Obsidian access and backup.

**IMPORTANT: All vault files use date-prefixed filenames** for Obsidian sorting: `YYYY-MM-DD-SLUG.md` (e.g., `2026-03-24-claude-code-dream-feature.md`). Use the video's publish date (or current date if new) as the prefix.

**Blog post** — save to `C:/Users/Chase/The Vault/content/blog/YYYY-MM-DD-SLUG.md`:
```markdown
---
title: "TITLE_HERE"
date: YYYY-MM-DD
youtube_video_id: VIDEO_ID_HERE
supabase_post_id: POST_ID_HERE
status: draft
tags: [tag1, tag2, tag3]
---

BLOG CONTENT HERE
```

**Twitter thread** — save to `C:/Users/Chase/The Vault/content/twitter/YYYY-MM-DD-SLUG.md`:
```markdown
---
title: "TITLE_HERE"
date: YYYY-MM-DD
youtube_video_id: VIDEO_ID_HERE
supabase_post_id: POST_ID_HERE
status: draft
---

THREAD CONTENT HERE
```

**LinkedIn post (regular)** — save to `C:/Users/Chase/The Vault/content/linkedin/YYYY-MM-DD-SLUG.md`:
```markdown
---
title: "TITLE_HERE"
date: YYYY-MM-DD
youtube_video_id: VIDEO_ID_HERE
supabase_post_id: POST_ID_HERE
type: regular
status: draft
---

REGULAR LINKEDIN CONTENT HERE
```

**LinkedIn post (lead magnet) — TUTORIAL VIDEOS ONLY** — save to `C:/Users/Chase/The Vault/content/linkedin/YYYY-MM-DD-SLUG-lead-magnet.md`:
```markdown
---
title: "TITLE_HERE"
date: YYYY-MM-DD
youtube_video_id: VIDEO_ID_HERE
supabase_post_id: POST_ID_HERE
type: lead_magnet
status: draft
---

LEAD MAGNET LINKEDIN CONTENT HERE
```

**Skool guide (HTML) — TUTORIAL VIDEOS ONLY** — already saved during Step 8c to `C:/Users/Chase/The Vault/content/guides/SLUG-guide.html`

**Skool guide (markdown backup) — TUTORIAL VIDEOS ONLY** — already saved during Step 8c to `C:/Users/Chase/The Vault/content/guides/SLUG-guide.md`

Use the same slug from the blog post for all filenames so they're easy to cross-reference.

### Step 11 — Summary

Report what was created:
- Blog post title and Supabase post ID
- Twitter thread (number of tweets)
- LinkedIn post (regular version)
- Video type classification (tutorial or discussion)
- **If tutorial:** LinkedIn post (lead magnet version — "steal my" format), Skool guide (HTML path + markdown backup path), reminder to use YouTube thumbnail as LinkedIn image
- **If discussion:** Note that lead magnet/guide were skipped (discussion video)
- Vault files saved
- Any issues or review notes

Remind the user they can review and edit everything in the admin dashboard at `/admin` or in Obsidian under `/content`.

## Autonomy Rules

**Ask before saving.** Show each piece of content to the user before inserting into Supabase. If the user says "just do everything" or "save it all" or gives a signal they want full autonomy, then skip the review pauses and save directly.

**If the user only wants specific pieces** (e.g., "just the blog" or "twitter and linkedin only"), skip the ones they didn't ask for.

**If generating only one piece** (e.g., "write a linkedin post for this video"), still fetch the transcript but only generate and save that one piece. If the video already has a blog post in Supabase, use its `post_id` for the social content foreign key.

## Supabase REST API Config

All database operations use the Supabase REST API (PostgREST). No MCP server needed.

- **Base URL:** `https://hcibztuhkbtivrsivwkc.supabase.co/rest/v1/`
- **Service Role Key:** Read from `C:/Users/Chase/ChaseAIWeb/.env.local` → `SUPABASE_SERVICE_ROLE_KEY`
- **Required headers for every request:**
  - `apikey: $SUPABASE_SERVICE_ROLE_KEY`
  - `Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY`
  - `Content-Type: application/json`
- **To get the response back after insert/update:** add header `Prefer: return=representation`
- **Query filters:** Use PostgREST syntax in the URL (e.g., `?youtube_video_id=eq.VIDEO_ID`, `?id=eq.UUID`)
- **JSON payloads:** Always write to a temp file first (using the Write tool), then pass with `curl -d @filepath`. This avoids shell escaping issues with markdown content, apostrophes, and quotes.

**Tables used:**
- `posts` — blog posts (fields: id, title, slug, excerpt, content, cover_image, tags, published, published_at, youtube_video_id, meta_title, meta_description)
- `social_content` — twitter/linkedin content (fields: id, post_id, platform, content, status, published_at)

## Blog Content Formatting

The website renders blog markdown with `react-markdown` + `remark-gfm` + `rehype-highlight`. Match these patterns from existing published posts:

- **Cover image**: Always `https://i.ytimg.com/vi/{VIDEO_ID}/maxresdefault.jpg` — set in `cover_image` field, not embedded in markdown
- **No inline images** in the markdown content — it's text-only
- **H1** for the post title (first line of content)
- **H2** headings phrased as questions (SEO-friendly): `## How Does X Work?`
- **Bold hook** sentence right after H1
- **Bold text** for key phrases/takeaways within paragraphs — primary emphasis tool
- **No blockquotes** — don't use `>` syntax
- **Lists** with bold labels: `- **Scrape** — pull clean data from a page`
- **Inline code** with backticks for commands/tool names
- **Fenced code blocks** with language identifiers for multi-line code
- **FAQ section** at the end: `## Frequently Asked Questions` with `### H3` sub-questions, bold opening answer + 2-3 sentence explanation
- **CTA block** at the very end (identical across all posts) linking to Skool communities

## Notes

- The blog prompt is the most critical — follow it exactly
- All three prompts share the same Chase AI voice. If the output from any of them sounds generic or like "content marketing," it's wrong.
- The user's YouTube channel ID is `UCoy6cTJ7Tg0dqS-DI-_REsA` (Chase AI)
- All content saves as drafts by default — only publish when the user explicitly says to
- The `youtube_video_id` column on `posts` has a unique constraint — if a blog already exists for that video, the insert will fail. Always check first (Step 4.5).
- This is the primary content pipeline. N8N is no longer used.
