# YT Pipeline Execution Transcript

**Task:** Research what YouTubers are saying about Claude Code and Obsidian -- what are the best use cases people are finding?
**Date:** 2026-03-04
**Skill:** yt-pipeline (C:\Users\Chase\.claude\skills\yt-pipeline\SKILL.md)

---

## Step 0 -- Pre-flight Check

### Command: `notebooklm status`
**Purpose:** Verify NotebookLM authentication is working before starting pipeline.
**Output:**
```
Current Context
+--------------------------------------------------------------------+
| Property     | Value                                               |
|--------------+-----------------------------------------------------|
| Notebook ID  | 749786d5-cc22-4210-b5a5-9c46b9b4ad5a                |
| Title        | Kallaway Storytelling & Hook Frameworks - Deep Dive |
| Ownership    | Owner                                               |
| Created      | 2026-03-04                                          |
| Conversation | 1be1adf9-6e5c-4bf8-ab23-ae10ee618090                |
+--------------------------------------------------------------------+
```
**Decision:** Auth is working. Proceed.

---

## Step 1 -- Understand the Request

**User message analysis:**
- **Search query:** "Claude Code Obsidian"
- **Analysis goal:** Best use cases people are finding (what YouTubers are saying)
- **Deliverable type:** None explicitly requested -- research/analysis only

**Decision:** Request is clear enough to proceed without clarification. The user wants to understand the YouTube landscape around Claude Code + Obsidian use cases, which aligns with their current video project.

---

## Step 2 -- Search YouTube

### Command: `python ~/.claude/skills/yt-search/scripts/search.py "Claude Code Obsidian" --count 10 --months 6`
**Purpose:** Search YouTube for relevant videos on Claude Code + Obsidian.
**Rationale for query:** Used the exact topic "Claude Code Obsidian" since it's specific enough. Used `--months 6` since this is a fast-moving topic where recency matters.
**Output:**
```
Searching YouTube for: "Claude Code Obsidian" (top 10 results, last 6 months)...

(Filtered out 1 video(s) older than 6 months)

 1. Claude Code + Obsidian = UNSTOPPABLE
    Chase AI (51.3K subs)  ·  13,895 views  ·  14:40  ·  Mar 04, 2026
    https://youtube.com/watch?v=eRr2rTKriDM

 2. How I Use Obsidian + Claude Code to Run My Life
    Greg Isenberg (562.0K subs)  ·  119,124 views  ·  58:57  ·  Feb 23, 2026
    https://youtube.com/watch?v=6MBq1paspVU

 3. Claude x Obsidian: Setting Up Claude Code (Guide)
    Construct By Dee (5.1K subs)  ·  883 views  ·  16:30  ·  Mar 03, 2026
    https://youtube.com/watch?v=cr9_A4kGzBc

 4. I connected Claude Code to Obsidian and it made me 10x more productive
    Noah Vincent (2.1K subs)  ·  10,669 views  ·  35:11  ·  Feb 27, 2026
    https://youtube.com/watch?v=BLdO-32I6Yc

 5. I Built My Second Brain with Claude Code + Obsidian + Skills (Here's How)
    Cole Medin (193.0K subs)  ·  43,727 views  ·  20:43  ·  Jan 26, 2026
    https://youtube.com/watch?v=jYMhDEzNAN0

 6. Obsidian Just Won
    Linking Your Thinking with Nick Milo (316.0K subs)  ·  115,047 views  ·  8:15  ·  Feb 06, 2026
    https://youtube.com/watch?v=y6YTk0C5pBY

 7. This Claude Code Second Brain Manages My ENTIRE Life in Obsidian (100% Private)
    Brad | AI & Automation (467 subs)  ·  5,682 views  ·  24:26  ·  Jan 27, 2026
    https://youtube.com/watch?v=wdc2tI_TGtM

 8. Obsidian + AI: How to Do It The Right Way (Claude Code + Obsidian)
    Linking Your Thinking with Nick Milo (316.0K subs)  ·  89,430 views  ·  13:44  ·  Sep 11, 2025
    https://youtube.com/watch?v=a1FDaoF8Jog

 9. Using Claude and Obsidian to manage my PM work
    A Better Computer (39.5K subs)  ·  10,167 views  ·  10:14  ·  Nov 04, 2025
    https://youtube.com/watch?v=DEyFa4rjhzo

10. Build BEAUTIFUL Diagrams with Claude Code (Full Workflow)
    Cole Medin (193.0K subs)  ·  39,933 views  ·  9:53  ·  Mar 02, 2026
    https://youtube.com/watch?v=m3fqyXZ4k4I
```
**Result:** 10 results returned, 1 filtered for age. Strong results set with high relevance.

---

## Step 3 -- Auto-Select Videos

**Selection analysis (applied criteria: relevance, engagement, recency, depth, source diversity):**

| # | Video | Decision | Reasoning |
|---|-------|----------|-----------|
| 1 | Chase AI - "Claude Code + Obsidian = UNSTOPPABLE" | DROP | User's own video -- not useful for research on what *others* are saying |
| 2 | Greg Isenberg - "How I Use Obsidian + Claude Code to Run My Life" | SELECT | Highest views (119K), major creator (562K subs), long-form deep dive (59 min) |
| 3 | Construct By Dee - "Claude x Obsidian: Setting Up Claude Code" | SELECT | Setup guide angle, high views-to-subs ratio (17%), unique perspective |
| 4 | Noah Vincent - "I connected Claude Code to Obsidian" | SELECT | Exceptional views-to-subs ratio (508%!), long-form (35 min), highly relevant |
| 5 | Cole Medin - "Second Brain with Claude Code + Obsidian + Skills" | SELECT | Strong engagement (43K views), Skills angle, unique perspective |
| 6 | Nick Milo - "Obsidian Just Won" | SELECT | Major Obsidian thought leader (316K subs), 115K views, authoritative perspective |
| 7 | Brad - "Claude Code Second Brain Manages My ENTIRE Life" | SELECT | Extraordinary views-to-subs ratio (1217%!), long-form (24 min), unique small-creator angle |
| 8 | Nick Milo - "Obsidian + AI: How to Do It The Right Way" | DROP | Duplicate channel with #6 -- kept #6 because it's newer (Feb vs Sep) |
| 9 | A Better Computer - "Using Claude and Obsidian to manage my PM work" | SELECT | Unique PM work angle, good channel (39.5K subs), diverse perspective |
| 10 | Cole Medin - "Build BEAUTIFUL Diagrams with Claude Code" | DROP | Off-topic (diagrams, not Obsidian use cases), duplicate channel with #5 |

**Final selection: 7 videos** from 7 different channels.

---

## Step 4 -- Create Notebook & Add Sources

### Command: `notebooklm create "YT Research: Claude Code + Obsidian Use Cases" --json`
**Output:**
```json
{
  "notebook": {
    "id": "28ca2904-b381-4fcb-a252-3c42b2ebb1b7",
    "title": "YT Research: Claude Code + Obsidian Use Cases",
    "created_at": null
  }
}
```

### Command: `notebooklm use 28ca2904-b381-4fcb-a252-3c42b2ebb1b7`
**Output:** Context set successfully.

### Adding Sources (7 videos):

| # | Video | Source ID | Status |
|---|-------|-----------|--------|
| 1 | Greg Isenberg | 22d79331-558b-4786-b433-f1582f2d9492 | Added |
| 2 | Construct By Dee | 49409448-f1a1-4e53-b1bc-2a1cbfc57190 | Added |
| 3 | Noah Vincent | 5faa7890-51e6-4c5d-91ee-23df924548d8 | Added |
| 4 | Cole Medin | c53a4dc7-c7e5-40e4-a423-190a40420f96 | Added |
| 5 | Nick Milo | c54d3b8d-5d02-4ce1-b4ea-9dd2be6faf83 | Added |
| 6 | Brad | 8560ff25-0931-4075-ad63-a292db5c60fb | Added |
| 7 | A Better Computer | 8dbbfbff-4d21-4780-818a-e45180aa2240 | Added |

### Waiting for Sources to Process:

**Error encountered on first wait command:** `UnicodeEncodeError: 'charmap' codec can't encode character '\u2713'` -- Windows cp1252 encoding can't handle the Rich library's checkmark character.

**Resolution:** Added `PYTHONIOENCODING=utf-8` environment variable prefix to all subsequent notebooklm commands.

All 7 sources waited and confirmed ready:
- Source 1 (Greg Isenberg): Ready
- Source 2 (Construct By Dee): Ready
- Source 3 (Noah Vincent): Ready
- Source 4 (Cole Medin): Ready
- Source 5 (Nick Milo): Ready
- Source 6 (Brad): Ready
- Source 7 (A Better Computer): Ready

**Skipped sources:** None. All 7 processed successfully.

---

## Step 5 -- Analysis

### Question 1: `notebooklm ask "What are the top use cases and workflows people are describing for using Claude Code with Obsidian? List each distinct use case with specific examples from the videos." --new`

**Purpose:** Identify all distinct use cases with concrete examples.
**Result:** NotebookLM identified 6 major use case categories:
1. Personal Assistant & Administrative Automation
2. Thinking Partner & Deep Pattern Recognition
3. Content Creation & Writing
4. Project Management & "Chief of Staff" Workflows
5. Knowledge Management Maintenance
6. Integration with External Tools (MCP)

Each category included specific examples with source citations.

### Question 2: `notebooklm ask "Where do these creators agree on the value of Claude Code + Obsidian, and where do they have different perspectives or approaches? Are there any common pain points or limitations they mention?"`

**Purpose:** Surface consensus, disagreements, and limitations.
**Result:** Identified 4 areas of agreement (persistent context, markdown format, ownership, agentic capabilities), 4 areas of disagreement (integrated vs. separate terminal, organizational philosophy, skill architecture, output control), and 5 pain points (latency, terminal barrier, privacy, calibration, cost).

### Question 3: `notebooklm ask "What are the most actionable takeaways someone could apply immediately if they wanted to start using Claude Code with Obsidian as a personal assistant? What specific setups, commands, or skills do the creators recommend starting with?"`

**Purpose:** Extract actionable, implementable recommendations.
**Result:** Identified 5 categories of actionable advice: integrated setup steps, context layer establishment, immediate commands (/new, /today, /delegate, /context load), essential skills to develop, and a daily workflow routine.

---

## Step 6 -- Deliverable

No specific deliverable was requested by the user (no podcast, report, quiz, etc.). Skipped this step per skill instructions.

---

## Post-Pipeline -- Save to Vault

### File Created: `/research/claude-code-obsidian-use-cases.md`
**Purpose:** Save research findings as an Obsidian-formatted note following vault conventions.
**Contents:** Date, sources, key takeaways, ranked use cases, agreement/disagreement matrix, pain points, and quick-start recommendations. Includes wiki links to related notes.

---

## Summary

| Metric | Value |
|--------|-------|
| Pipeline steps executed | 5 of 6 (Step 6 skipped -- no deliverable requested) |
| YouTube search queries | 1 |
| Videos found | 10 |
| Videos selected | 7 |
| Videos dropped | 3 (own video, duplicate channel, off-topic) |
| Sources added to NotebookLM | 7 |
| Sources processed successfully | 7 |
| Sources failed | 0 |
| NotebookLM questions asked | 3 |
| Errors encountered | 1 (Windows Unicode encoding -- resolved with PYTHONIOENCODING=utf-8) |
| Files created | 2 (research note + output files) |
| Total duration | ~5 minutes |
