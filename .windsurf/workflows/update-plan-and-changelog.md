---
description: Update Plan & Changelog Before Commit
---

This workflow reminds contributors to refresh the high-level project plan (`plan.md`) **and** the `CHANGELOG.md` each time work is completed and before code is pushed.

1. Review your changes and mark any completed tasks in `plan.md`. Add new tasks or adjust priorities where needed.
2. Open `CHANGELOG.md`.
   - Add a new version header following Keep-a-Changelog style, e.g.
     ```markdown
     ## [1.4.0] – 2025-07-09
     ```
   - Under **Added / Changed / Fixed / Removed**, bullet the user-facing improvements you just implemented.
3. Save both files.
// turbo
4. Stage and commit the updates
   ```bash
   git add plan.md CHANGELOG.md
   git commit -m "docs: update plan and changelog"
   ```
// turbo
5. Push to the remote repository
   ```bash
   git push
   ```
6. Create or update your Pull Request.

Outcome: The repository history always includes an up-to-date roadmap and version log.


