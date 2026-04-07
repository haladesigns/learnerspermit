# Chase AI Content Skills for Claude Code

## What's Included

### Ready to Go (no extra setup)
- **hooks** — Generate YouTube video hooks using desire-based framework
- **outlines** — Full YouTube video outlines with talking points, visual aids, and time budgets
- **yt-titles** — YouTube title generator based on your channel's actual performance data
- **short-form** — Repurpose long-form videos into Reels, Shorts, and TikTok clips
- **content-cascade** — Generate blog post, Twitter thread, and LinkedIn post from a YouTube video

### Requires NotebookLM CLI
- **yt-pipeline** — End-to-end YouTube research pipeline (search, analyze, generate podcasts/reports)
- **ideation** — Generate positioned video ideas with competitive gaps and desire mapping

Install NotebookLM CLI: https://github.com/nichochar/notebooklm-cli

### Requires YouTube Data API Key
- **yt-search** — Search YouTube with structured results (used by yt-pipeline, ideation, and yt-titles)
- **yt-titles** — Also uses the YouTube API to pull your channel performance data

You'll need a YouTube Data API v3 key from Google Cloud Console set as `YOUTUBE_API_KEY` environment variable.

## Installation

1. Open your terminal
2. Copy the skill folders into your Claude Code skills directory:
   - **Mac/Linux:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<YourName>\.claude\skills\`
3. Restart Claude Code
4. Type `/` in Claude Code to see your new skills

That's it. Each skill activates automatically when you use its trigger phrases.
