# 🛡️ branchguard

> Enforces branch naming conventions and prevents direct pushes to protected branches.

[![CI](https://img.shields.io/github/actions/workflow/status/yourusername/branchguard/ci.yml?style=for-the-badge)](https://github.com/yourusername/branchguard/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)
[![Codespace Ready](https://img.shields.io/badge/Codespace-Ready-green?style=for-the-badge&logo=github)](https://codespaces.new/yourusername/branchguard)

---

## 🚀 What is branchguard?

`branchguard` is a git hook + CI tool that enforces branch naming conventions across your team, blocks direct pushes to protected branches, and keeps your repo's branching strategy clean and consistent.

```bash
# Install hooks into current repo
branchguard install

# Check current branch name
branchguard check

# List all branches violating conventions
branchguard audit

# Set protected branches
branchguard protect main develop staging
```

---

## ✨ Features

- 📛 Enforces naming patterns: `feat/*`, `fix/*`, `chore/*`, `release/*`
- 🔒 Blocks commits directly to `main`, `master`, `develop`
- 🎣 Git hook auto-installer (pre-push, pre-commit)
- ⚙️ Config via `.branchguard.yml`
- 🚦 CI/CD integration with GitHub Actions
- 📊 Branch audit report across the whole repo
- 🔧 Auto-suggest corrected branch names

---

## ⚙️ Configuration

```yaml
# .branchguard.yml
protected:
  - main
  - master
  - develop
  - staging

patterns:
  - "feat/*"
  - "fix/*"
  - "chore/*"
  - "docs/*"
  - "release/v*"
  - "hotfix/*"

allow_merge_commits: false
require_issue_number: false
```

---

## 🏆 GitHub Achievement Scripts

```bash
bash scripts/setup.sh
bash scripts/unlock-all.sh
bash scripts/quickdraw.sh
bash scripts/yolo.sh
bash scripts/publicist.sh
bash scripts/pull-shark.sh 2
bash scripts/pair-extraordinaire.sh "Name" "email@example.com"
node src/achievement-tracker.js
```

---

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)
