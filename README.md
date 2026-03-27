# gh-pr-visualizer

Visualize open pull requests as a branch tree.

Useful when a repo has lots of open PRs and some of them are stacked on top of each other.
Instead of asking:

- which PR depends on which
- which branch should be reviewed first
- whether another branch needs to be synced before merge

you get a quick graph of the actual branch structure.

![Screenshot](https://raw.githubusercontent.com/kamskr/gh-pr-visualizer/main/demo-screenshot.png)

## What It Solves

In bigger projects, stacked PRs get messy fast.

- review order gets unclear
- dependency chains live in Slack messages or PR comments
- it is easy to miss that one PR is based on another feature branch instead of `main`
- reviewers and authors waste time figuring out what needs to land or sync first

This tool pulls open PRs, infers parent/child relationships from `baseRefName` and `headRefName`, and renders the stack as a tree so you can inspect the structure at a glance.

## Features

- visualizes open PRs as a tree based on actual branch relationships
- shows root branches, tree depth, visible PR count, and review-state counts
- search by PR number, title, branch name, author, or review status
- focus a subtree when you want to review one stack in isolation
- collapse or expand subtrees to reduce noise in large graphs
- open an entire PR chain at once with `Open review batch`
- copy the current branch name of the selected PR
- copy the full list of PR links for the selected subtree
- inspect review facts, focus path, and mini timeline for the selected PR
- refresh live data from GitHub without restarting the tool

## Install

As a GitHub CLI extension:

```bash
gh extension install kamskr/gh-pr-visualizer
```

Then run:

```bash
gh pr-visualizer
```

As a standalone CLI:

```bash
npm install -g gh-pr-visualizer
```

Then run:

```bash
gh-pr-visualizer
```

## Requirements

- `gh` installed
- `gh auth login` done
- run inside a Git repository hosted on GitHub
- Node.js 18+

## Usage

Live GitHub data:

```bash
gh pr-visualizer
```

Prevent the tool from auto-opening a browser window:

```bash
gh pr-visualizer --no-open
```
