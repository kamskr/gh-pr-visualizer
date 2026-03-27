#!/usr/bin/env node
const { execFileSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const SERVER_PORT = 43123;

function runGh(args) {
	return execFileSync("gh", args, { encoding: "utf8" });
}

function getPRs() {
	const query = `
query($owner: String!, $name: String!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(
      first: 100
      after: $endCursor
      states: OPEN
      orderBy: { field: CREATED_AT, direction: ASC }
	    ) {
	      nodes {
	        number
	        title
	        url
	        baseRefName
	        headRefName
	        isDraft
	        reviewDecision
	        changedFiles
	        additions
	        deletions
	        createdAt
	        updatedAt
	        author {
	          login
	        }
	        latestReviews(first: 4) {
	          nodes {
	            state
	            submittedAt
	            author {
	              login
	            }
	          }
	        }
	      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`;

	const out = runGh([
		"api",
		"graphql",
		"--paginate",
		"--slurp",
		"-F",
		"owner={owner}",
		"-F",
		"name={repo}",
		"-f",
		`query=${query}`,
	]);

	const pages = JSON.parse(out);
	return pages
		.flatMap((page) => page.data.repository.pullRequests.nodes)
		.map((pr) => ({
			number: pr.number,
			title: pr.title,
			url: pr.url,
			baseRefName: pr.baseRefName,
			headRefName: pr.headRefName,
			isDraft: pr.isDraft,
			reviewDecision: pr.reviewDecision,
			changedFiles: pr.changedFiles,
			additions: pr.additions,
			deletions: pr.deletions,
			createdAt: pr.createdAt,
			updatedAt: pr.updatedAt,
			author: pr.author?.login ? { login: pr.author.login } : null,
			latestReviews: (pr.latestReviews?.nodes ?? []).map((review) => ({
				state: review.state,
				submittedAt: review.submittedAt,
				author: review.author?.login ? { login: review.author.login } : null,
			})),
		}));
}

function getRepoInfo() {
	const out = runGh(["repo", "view", "--json", "name,nameWithOwner,url"]);
	const repo = JSON.parse(out);
	return {
		name: repo.name,
		nameWithOwner: repo.nameWithOwner ?? repo.name,
		url: repo.url,
	};
}

function getDemoRepoInfo() {
	return {
		name: "demo-stacked-prs",
		nameWithOwner: "kamskr/demo-stacked-prs",
		url: "https://github.com/kamskr/demo-stacked-prs",
	};
}

function getDemoPRs() {
	return [
		{
			number: 101,
			title: "Shell: launch visual PR map",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/101",
			baseRefName: "main",
			headRefName: "feat/pr-map-shell",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 9,
			additions: 412,
			deletions: 67,
			createdAt: "2026-03-20T09:15:00.000Z",
			updatedAt: "2026-03-24T08:42:00.000Z",
			author: { login: "kamskr" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-21T13:20:00.000Z",
					author: { login: "monalisa" },
				},
			],
		},
		{
			number: 102,
			title: "Data: wire live GitHub fetch",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/102",
			baseRefName: "feat/pr-map-shell",
			headRefName: "feat/live-fetch",
			isDraft: false,
			reviewDecision: "REVIEW_REQUIRED",
			changedFiles: 14,
			additions: 286,
			deletions: 58,
			createdAt: "2026-03-21T10:05:00.000Z",
			updatedAt: "2026-03-24T11:10:00.000Z",
			author: { login: "bkeepers" },
			latestReviews: [],
		},
		{
			number: 103,
			title: "UI: card stack polish and focus mode",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/103",
			baseRefName: "feat/live-fetch",
			headRefName: "feat/focus-mode",
			isDraft: false,
			reviewDecision: "CHANGES_REQUESTED",
			changedFiles: 11,
			additions: 198,
			deletions: 43,
			createdAt: "2026-03-21T16:32:00.000Z",
			updatedAt: "2026-03-25T09:55:00.000Z",
			author: { login: "kamskr" },
			latestReviews: [
				{
					state: "CHANGES_REQUESTED",
					submittedAt: "2026-03-25T08:30:00.000Z",
					author: { login: "defunkt" },
				},
			],
		},
		{
			number: 104,
			title: "Filters: author, branch, review state",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/104",
			baseRefName: "feat/focus-mode",
			headRefName: "feat/filter-pills",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 8,
			additions: 154,
			deletions: 26,
			createdAt: "2026-03-22T07:48:00.000Z",
			updatedAt: "2026-03-25T10:04:00.000Z",
			author: { login: "kamskr" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-24T14:12:00.000Z",
					author: { login: "gaearon" },
				},
			],
		},
		{
			number: 105,
			title: "Layout: split detail rail from tree canvas",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/105",
			baseRefName: "feat/focus-mode",
			headRefName: "feat/detail-rail",
			isDraft: false,
			reviewDecision: "REVIEW_REQUIRED",
			changedFiles: 12,
			additions: 221,
			deletions: 49,
			createdAt: "2026-03-22T09:22:00.000Z",
			updatedAt: "2026-03-25T12:25:00.000Z",
			author: { login: "yyx990803" },
			latestReviews: [],
		},
		{
			number: 106,
			title: "Search: focus a subtree from result click",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/106",
			baseRefName: "feat/filter-pills",
			headRefName: "feat/search-focus",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 7,
			additions: 118,
			deletions: 21,
			createdAt: "2026-03-22T11:40:00.000Z",
			updatedAt: "2026-03-25T15:18:00.000Z",
			author: { login: "bkeepers" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-24T17:01:00.000Z",
					author: { login: "monalisa" },
				},
			],
		},
		{
			number: 107,
			title: "Readme: add screenshot crop + quickstart",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/107",
			baseRefName: "feat/search-focus",
			headRefName: "docs/readme-shot",
			isDraft: true,
			reviewDecision: null,
			changedFiles: 4,
			additions: 71,
			deletions: 8,
			createdAt: "2026-03-22T13:05:00.000Z",
			updatedAt: "2026-03-25T17:36:00.000Z",
			author: { login: "kamskr" },
			latestReviews: [],
		},
		{
			number: 108,
			title: "Details: timeline and lineage mini-panels",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/108",
			baseRefName: "feat/detail-rail",
			headRefName: "feat/timeline-lineage",
			isDraft: false,
			reviewDecision: "CHANGES_REQUESTED",
			changedFiles: 10,
			additions: 193,
			deletions: 34,
			createdAt: "2026-03-22T15:24:00.000Z",
			updatedAt: "2026-03-25T18:05:00.000Z",
			author: { login: "defunkt" },
			latestReviews: [
				{
					state: "CHANGES_REQUESTED",
					submittedAt: "2026-03-25T17:50:00.000Z",
					author: { login: "gaearon" },
				},
			],
		},
		{
			number: 109,
			title: "Polish: compact node badges and counters",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/109",
			baseRefName: "feat/timeline-lineage",
			headRefName: "feat/compact-badges",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 5,
			additions: 84,
			deletions: 16,
			createdAt: "2026-03-22T18:10:00.000Z",
			updatedAt: "2026-03-25T19:22:00.000Z",
			author: { login: "kamskr" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-25T19:00:00.000Z",
					author: { login: "monalisa" },
				},
			],
		},
		{
			number: 110,
			title: "Infra: baseline release workflow",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/110",
			baseRefName: "main",
			headRefName: "chore/release-flow",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 6,
			additions: 122,
			deletions: 19,
			createdAt: "2026-03-19T12:12:00.000Z",
			updatedAt: "2026-03-23T15:44:00.000Z",
			author: { login: "hubot" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-20T09:10:00.000Z",
					author: { login: "monalisa" },
				},
			],
		},
		{
			number: 111,
			title: "CI: parallel screenshot smoke test",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/111",
			baseRefName: "chore/release-flow",
			headRefName: "test/smoke-shot",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 7,
			additions: 133,
			deletions: 24,
			createdAt: "2026-03-20T14:50:00.000Z",
			updatedAt: "2026-03-23T16:10:00.000Z",
			author: { login: "yyx990803" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-21T11:40:00.000Z",
					author: { login: "gaearon" },
				},
			],
		},
		{
			number: 112,
			title: "Fixtures: deterministic sample repo dataset",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/112",
			baseRefName: "test/smoke-shot",
			headRefName: "test/demo-fixtures",
			isDraft: false,
			reviewDecision: "APPROVED",
			changedFiles: 6,
			additions: 95,
			deletions: 13,
			createdAt: "2026-03-21T18:22:00.000Z",
			updatedAt: "2026-03-24T09:10:00.000Z",
			author: { login: "hubot" },
			latestReviews: [
				{
					state: "APPROVED",
					submittedAt: "2026-03-22T08:48:00.000Z",
					author: { login: "defunkt" },
				},
			],
		},
		{
			number: 113,
			title: "Ops: ship static export for docs site",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/113",
			baseRefName: "test/demo-fixtures",
			headRefName: "ops/static-export",
			isDraft: false,
			reviewDecision: "REVIEW_REQUIRED",
			changedFiles: 9,
			additions: 140,
			deletions: 31,
			createdAt: "2026-03-22T08:55:00.000Z",
			updatedAt: "2026-03-24T16:12:00.000Z",
			author: { login: "bkeepers" },
			latestReviews: [],
		},
		{
			number: 114,
			title: "Release: docs preview environment hook",
			url: "https://github.com/kamskr/demo-stacked-prs/pull/114",
			baseRefName: "ops/static-export",
			headRefName: "ops/docs-preview",
			isDraft: true,
			reviewDecision: null,
			changedFiles: 5,
			additions: 61,
			deletions: 9,
			createdAt: "2026-03-22T10:12:00.000Z",
			updatedAt: "2026-03-24T18:40:00.000Z",
			author: { login: "yyx990803" },
			latestReviews: [],
		},
	];
}

function buildForest(prs) {
	const children = new Map();
	const indegree = new Map();
	const byHead = new Map();

	for (const pr of prs) {
		children.set(pr.number, []);
		indegree.set(pr.number, 0);

		const group = byHead.get(pr.headRefName) ?? [];
		group.push(pr);
		byHead.set(pr.headRefName, group);
	}

	for (const pr of prs) {
		const parents = byHead.get(pr.baseRefName) ?? [];
		if (parents.length !== 1) {
			continue;
		}

		const [parent] = parents;
		if (parent.number === pr.number) {
			continue;
		}

		children.get(parent.number).push(pr);
		indegree.set(pr.number, indegree.get(pr.number) + 1);
	}

	for (const branch of children.values()) {
		branch.sort((a, b) => a.number - b.number);
	}

	const roots = prs
		.filter((pr) => indegree.get(pr.number) === 0)
		.sort((a, b) => a.number - b.number);

	return { roots, children };
}

function formatNode(pr) {
	return `#${pr.number} ${pr.title} [${pr.headRefName}] -> ${pr.baseRefName}`;
}

function makeNodeId(pr) {
	return `pr${pr.number}`;
}

function escapeDot(value) {
	return String(value)
		.replaceAll("\\", "\\\\")
		.replaceAll('"', '\\"')
		.replaceAll("\n", "\\n");
}

function makeDotLabel(pr) {
	const branch =
		pr.headRefName.length > 28
			? `${pr.headRefName.slice(0, 25)}...`
			: pr.headRefName;
	const title = pr.title.length > 64 ? `${pr.title.slice(0, 61)}...` : pr.title;
	return `#${pr.number}\\n${title}\\n${branch}`;
}

function renderNode(
	pr,
	children,
	lines,
	visited,
	stack,
	prefix = "",
	isLast = true,
	isRoot = false,
) {
	const connector = isRoot ? "" : isLast ? "└── " : "├── ";
	lines.push(`${prefix}${connector}${formatNode(pr)}`);
	visited.add(pr.number);
	stack.add(pr.number);

	const kids = children.get(pr.number) ?? [];
	const nextPrefix = prefix + (isRoot ? "" : isLast ? "    " : "│   ");

	kids.forEach((child, index) => {
		const childIsLast = index === kids.length - 1;
		const childConnector = childIsLast ? "└── " : "├── ";

		if (stack.has(child.number)) {
			lines.push(`${nextPrefix}${childConnector}↺ ${formatNode(child)}`);
			return;
		}

		if (visited.has(child.number)) {
			lines.push(`${nextPrefix}${childConnector}↩ ${formatNode(child)}`);
			return;
		}

		renderNode(
			child,
			children,
			lines,
			visited,
			stack,
			nextPrefix,
			childIsLast,
			false,
		);
	});

	stack.delete(pr.number);
}

function renderForest(prs, roots, children) {
	if (prs.length === 0) {
		return ["No open PRs found."];
	}

	const lines = [];
	const visited = new Set();
	const sortedPrs = [...prs].sort((a, b) => a.number - b.number);

	const renderComponent = (pr) => {
		renderNode(pr, children, lines, visited, new Set(), "", true, true);
	};

	for (const root of roots) {
		if (visited.has(root.number)) {
			continue;
		}

		renderComponent(root);
		lines.push("");
	}

	for (const pr of sortedPrs) {
		if (visited.has(pr.number)) {
			continue;
		}

		renderComponent(pr);
		lines.push("");
	}

	if (lines.at(-1) === "") {
		lines.pop();
	}

	return lines;
}

function renderDot(prs, roots, children) {
	const lines = [
		"digraph PRs {",
		"\trankdir=LR;",
		"\tgraph [splines=ortho, nodesep=0.45, ranksep=0.9, pad=0.2];",
		'\tnode [shape=box, style="rounded,filled", fillcolor="#f6f8fa", color="#d0d7de", fontname="Helvetica"];',
		'\tedge [color="#57606a", arrowsize=0.7];',
	];

	const sortedPrs = [...prs].sort((a, b) => a.number - b.number);
	for (const pr of sortedPrs) {
		const attrs = [
			`label="${escapeDot(makeDotLabel(pr))}"`,
			`tooltip="${escapeDot(formatNode(pr))}"`,
		];

		if (pr.url) {
			attrs.push(`URL="${escapeDot(pr.url)}"`);
			attrs.push(`href="${escapeDot(pr.url)}"`);
			attrs.push('target="_blank"');
		}

		lines.push(`\t${makeNodeId(pr)} [${attrs.join(", ")}];`);
	}

	for (const [parentNumber, kids] of children.entries()) {
		for (const child of kids) {
			lines.push(`\tpr${parentNumber} -> ${makeNodeId(child)};`);
		}
	}

	const rootIds = roots.map((pr) => makeNodeId(pr));
	if (rootIds.length > 1) {
		lines.push(`\t{ rank=same; ${rootIds.join("; ")}; }`);
	}

	lines.push("}");
	return lines;
}

function renderSvg(prs, roots, children) {
	const dot = `${renderDot(prs, roots, children).join("\n")}\n`;

	try {
		return execFileSync("dot", ["-Tsvg"], { input: dot, encoding: "utf8" });
	} catch (error) {
		if (error.code === "ENOENT") {
			console.error(
				"Graphviz is required for `--svg`.\nInstall it with: brew install graphviz",
			);
			process.exit(1);
		}

		throw error;
	}
}

function getComponentRoots(prs, roots, children) {
	const orderedRoots = [];
	const visited = new Set();
	const sortedPrs = [...prs].sort((a, b) => a.number - b.number);

	const visit = (pr) => {
		if (visited.has(pr.number)) {
			return;
		}

		visited.add(pr.number);
		for (const child of children.get(pr.number) ?? []) {
			visit(child);
		}
	};

	for (const root of roots) {
		if (visited.has(root.number)) {
			continue;
		}

		orderedRoots.push(root.number);
		visit(root);
	}

	for (const pr of sortedPrs) {
		if (visited.has(pr.number)) {
			continue;
		}

		orderedRoots.push(pr.number);
		visit(pr);
	}

	return orderedRoots;
}

function escapeInlineJson(value) {
	return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function getFaviconDataUrl() {
	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0d1117"/>
  <rect x="7" y="7" width="50" height="50" rx="12" fill="#161b22" stroke="#30363d"/>
  <path d="M20 18v28" stroke="#2f81f7" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 24h12M20 40h12" stroke="#30363d" stroke-width="2"/>
  <path d="M20 24c10 0 10 8 20 8h4" stroke="#8b949e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M20 40c10 0 10-8 20-8h4" stroke="#8b949e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="24" r="4.5" fill="#2f81f7"/>
  <circle cx="20" cy="40" r="4.5" fill="#2f81f7"/>
  <circle cx="44" cy="32" r="6.5" fill="#238636" stroke="#7ee787" stroke-width="1.5"/>
</svg>`.trim();

	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function serializeGraph(prs, roots, children, repo) {
	return {
		generatedAt: new Date().toISOString(),
		repo,
		prs: [...prs].sort((a, b) => a.number - b.number),
		componentRoots: getComponentRoots(prs, roots, children),
		children: Object.fromEntries(
			[...children.entries()].map(([parent, kids]) => [
				parent,
				kids.map((child) => child.number),
			]),
		),
	};
}

function getGraphPayload(options = {}) {
	const repo = options.demo ? getDemoRepoInfo() : getRepoInfo();
	const prs = options.demo ? getDemoPRs() : getPRs();
	const { roots, children } = buildForest(prs);
	return serializeGraph(prs, roots, children, repo);
}

function renderHtml(options = {}) {
	const favicon = getFaviconDataUrl();

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PR Tree</title>
  <link rel="icon" href="${favicon}">
  <link rel="apple-touch-icon" href="${favicon}">
  <style>
    :root {
      --bg: #0d1117;
      --panel: #161b22;
      --panel-2: #0f141b;
      --card: #1c2128;
      --line: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --blue: #2f81f7;
      --green: #238636;
      --green-soft: rgba(35, 134, 54, 0.18);
      --red: #da3633;
      --red-soft: rgba(218, 54, 51, 0.16);
      --amber: #d29922;
      --amber-soft: rgba(210, 153, 34, 0.18);
      --gray-soft: rgba(139, 148, 158, 0.18);
      --shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }

    .loading-screen {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top, rgba(47, 129, 247, 0.18), transparent 32%),
        linear-gradient(180deg, rgba(13, 17, 23, 0.98), rgba(13, 17, 23, 0.995));
      transition: opacity 180ms ease, visibility 180ms ease;
    }

    .loading-screen.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .loading-card {
      width: min(520px, 100%);
      border: 1px solid rgba(48, 54, 61, 0.95);
      border-radius: 18px;
      padding: 28px 24px;
      background:
        linear-gradient(180deg, rgba(28, 33, 40, 0.98), rgba(15, 20, 27, 0.98));
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
      text-align: center;
    }

    .loading-mark {
      width: 56px;
      height: 56px;
      margin: 0 auto 18px;
      border-radius: 50%;
      border: 3px solid rgba(126, 231, 135, 0.16);
      border-top-color: #7ee787;
      border-right-color: #2f81f7;
      animation: loader-spin 900ms linear infinite;
    }

    .loading-title {
      margin: 0;
      font-size: clamp(28px, 4vw, 40px);
      line-height: 0.98;
      letter-spacing: -0.04em;
    }

    .loading-copy {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    @keyframes loader-spin {
      to { transform: rotate(360deg); }
    }

    main {
      position: relative;
      z-index: 1;
      width: min(1500px, calc(100% - 24px));
      margin: 20px auto 40px;
    }

    .mono, .meta, .pill, .action, .search, .eyebrow {
      font-family: "SFMono-Regular", "JetBrains Mono", "Menlo", monospace;
    }

    .hero {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: var(--shadow);
      padding: 20px;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: 0.02em;
      text-transform: none;
      font-weight: 600;
    }

    .repo-link {
      color: #7ee787;
      text-decoration: none;
      border-bottom: 1px solid rgba(126, 231, 135, 0.35);
      transition: color 140ms ease, border-color 140ms ease;
    }

    .repo-link:hover,
    .repo-link:focus-visible {
      color: #a2f2af;
      border-color: rgba(162, 242, 175, 0.8);
      outline: none;
    }

    h1 {
      margin: 10px 0 8px;
      font-size: clamp(34px, 6vw, 60px);
      line-height: 0.95;
      letter-spacing: -0.05em;
    }

    .subtitle {
      max-width: 72ch;
      margin: 0;
      color: var(--muted);
      line-height: 1.55;
    }

    .toolbar {
      margin-top: 22px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
    }

    .search {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text);
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
    }

    .search:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.16);
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .action {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #21262d;
      color: var(--text);
      padding: 8px 12px;
      font-size: 12px;
      letter-spacing: 0.02em;
      text-transform: none;
      cursor: pointer;
      font-weight: 500;
    }

    .action:hover { background: #30363d; border-color: #8b949e; }

    .stats {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .stat {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      background: var(--panel);
    }

    .stat strong {
      display: block;
      font-size: 28px;
      line-height: 1;
      letter-spacing: -0.05em;
    }

    .stat span {
      display: block;
      margin-top: 8px;
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) 360px;
      gap: 16px;
      align-items: start;
      margin-top: 18px;
    }

    .tree-wrap,
    .detail-panel {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
    }

    .tree-wrap {
      padding: 24px 20px 30px;
    }

    .tree-center {
      display: block;
    }

    #tree {
      width: min(100%, 1080px);
      margin: 0 auto;
    }

    .node-shell {
      position: relative;
      display: block;
      width: 100%;
    }

    .hub {
      max-width: 1080px;
      margin: 0 auto;
    }

    .pr-card {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--card);
      box-shadow: none;
      padding: 12px;
      cursor: pointer;
      transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;
    }

    .pr-card.root-card {
      background: #0f141b;
    }

    .pr-card:hover {
      transform: translateY(-1px);
      border-color: rgba(47, 129, 247, 0.42);
    }

    .pr-card.is-selected {
      border-color: rgba(47, 129, 247, 0.72);
      box-shadow: inset 0 0 0 1px rgba(47, 129, 247, 0.52);
    }

    .pr-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: flex-start;
    }

    .pr-title {
      margin: 0;
      font-size: 16px;
      line-height: 1.3;
    }

    .pr-title a {
      color: var(--text);
      text-decoration: none;
    }

    .pr-title a:hover { color: #58a6ff; text-decoration: underline; }

    .pr-link {
      flex: 0 0 auto;
      color: var(--blue);
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 11px;
      letter-spacing: 0.02em;
      text-transform: none;
      background: #21262d;
    }

    .toggle {
      border: 1px solid rgba(139, 148, 158, 0.24);
      border-radius: 6px;
      background: #21262d;
      color: var(--muted);
      padding: 6px 8px;
      font-size: 12px;
      cursor: pointer;
      margin-left: 8px;
    }

    .toggle:hover { border-color: rgba(47, 129, 247, 0.45); color: var(--text); }

    .meta {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      color: var(--muted);
      font-size: 11px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 8px;
      background: #21262d;
      border: 1px solid rgba(139, 148, 158, 0.15);
    }

    .review-reviewed { background: var(--green-soft); border-color: rgba(35, 134, 54, 0.35); color: #7ee787; }
    .review-not-reviewed { background: var(--amber-soft); border-color: rgba(210, 153, 34, 0.35); color: #e3b341; }
    .review-changes-requested { background: var(--red-soft); border-color: rgba(218, 54, 51, 0.35); color: #ff7b72; }
    .review-draft { background: var(--gray-soft); border-color: rgba(139, 148, 158, 0.3); color: #c9d1d9; }
    .pill.focused { border-color: rgba(47, 129, 247, 0.45); color: #79c0ff; }

    .children-stack {
      position: relative;
      display: grid;
      gap: 16px;
      margin: 12px 0 0 10px;
      padding-left: 12px;
      border-left: 1px solid var(--line);
    }

    .children-stack.root-stack {
      margin-top: 18px;
      gap: 18px;
    }

    .child-branch {
      position: relative;
      display: block;
    }

    .child-branch::before {
      content: "";
      position: absolute;
      top: 22px;
      left: -12px;
      width: 12px;
      border-top: 1px solid var(--line);
    }

    .root-section {
      display: grid;
      gap: 12px;
    }

    .cycle-note {
      color: var(--muted);
      font-size: 12px;
      padding: 10px 12px;
      border: 1px dashed var(--line);
      border-radius: 12px;
      background: rgba(22, 27, 34, 0.65);
    }

    .footer-note {
      margin-top: 16px;
      color: var(--muted);
      font-size: 12px;
    }

    .detail-panel {
      position: sticky;
      top: 18px;
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .detail-block {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel-2);
      padding: 14px;
    }

    .detail-title {
      margin: 0 0 10px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .detail-head {
      display: grid;
      gap: 8px;
    }

    .detail-head h2 {
      margin: 0;
      font-size: 20px;
      line-height: 1.2;
    }

    .detail-head a {
      color: #79c0ff;
      text-decoration: none;
    }

    .detail-head a:hover { text-decoration: underline; }

    .detail-actions {
      display: grid;
      gap: 10px;
    }

    .action.wide {
      width: 100%;
      text-align: left;
      justify-content: flex-start;
    }

    .detail-list,
    .timeline {
      display: grid;
      gap: 10px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
      color: var(--muted);
      font-size: 12px;
    }

    .detail-row strong {
      color: var(--text);
      font-size: 13px;
    }

    .timeline-item,
    .export-box,
    .lineage-item {
      border: 1px solid rgba(139, 148, 158, 0.15);
      border-radius: 6px;
      padding: 10px 12px;
      background: #161b22;
      color: var(--muted);
      font-size: 12px;
    }

    .timeline-item strong,
    .lineage-item strong {
      display: block;
      margin-bottom: 4px;
      color: var(--text);
      font-size: 13px;
    }

    .export-box {
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 220px;
      overflow: auto;
    }

    .empty {
      margin-top: 18px;
      border: 1px dashed var(--line);
      border-radius: 8px;
      padding: 26px;
      color: var(--muted);
      text-align: center;
      background: var(--panel);
    }

    @media (max-width: 900px) {
      main { width: min(100% - 12px, 1500px); margin-top: 10px; }
      .hero { padding: 18px; }
      .toolbar { grid-template-columns: 1fr; }
      .actions { justify-content: flex-start; }
      .workspace { grid-template-columns: 1fr; }
      .tree-wrap { padding: 18px 14px 24px; }
      #tree { width: 100%; }
      .children-stack { margin-left: 6px; padding-left: 10px; }
      .child-branch::before { left: -10px; width: 10px; }
      .detail-panel { position: static; }
    }
  </style>
</head>
<body>
  <div class="loading-screen" id="loading-screen" aria-live="polite">
    <div class="loading-card">
      <div class="mono eyebrow">graph boot</div>
      <div class="loading-mark" aria-hidden="true"></div>
      <h1 class="loading-title">Loading PR graph</h1>
      <p class="loading-copy" id="loading-copy">Pulling live repo and PR data from GitHub.</p>
    </div>
  </div>
  <main>
    <section class="hero">
      <div class="eyebrow" id="repo-label">
        <a class="repo-link" id="repo-link" href="#" target="_blank" rel="noreferrer">repository</a>
        <span>· open pr graph</span>
      </div>
      <div class="toolbar">
        <input id="search" class="search" type="search" placeholder="search: PR-4910, feature-branch, @kamskr, approved, review required">
        <div class="actions">
          <button class="action" id="refresh">Refresh</button>
          <button class="action" id="reset">Reset search</button>
        </div>
      </div>
      <div class="stats" id="stats"></div>
    </section>

    <section class="workspace">
      <div class="tree-wrap">
        <div class="tree-center">
          <div id="tree"></div>
        </div>
        <div class="footer-note mono" id="generated"></div>
      </div>
      <aside class="detail-panel" id="detail"></aside>
    </section>
  </main>

  <script>
    const demoMode = ${escapeInlineJson(Boolean(options.demo))};
    let data = null;
    let byId = new Map();
    let childMap = {};
    let parentMap = new Map();
    const state = {
      query: "",
      selectedId: null,
      focusId: null,
      collapsed: new Set(),
    };

    const treeEl = document.getElementById("tree");
    const statsEl = document.getElementById("stats");
    const detailEl = document.getElementById("detail");
    const searchEl = document.getElementById("search");
    const generatedEl = document.getElementById("generated");
    const repoLinkEl = document.getElementById("repo-link");
    const loadingScreenEl = document.getElementById("loading-screen");
    const loadingCopyEl = document.getElementById("loading-copy");

    const setLoading = (active, message = "Pulling live repo and PR data from GitHub.") => {
      loadingCopyEl.textContent = message;
      loadingScreenEl.classList.toggle("hidden", !active);
    };

    const childrenOf = (id) => childMap[id] || [];

    const reviewMeta = (pr) => {
      if (pr.isDraft) {
        return { bucket: "draft", label: "draft" };
      }

      if (pr.reviewDecision === "APPROVED") {
        return { bucket: "reviewed", label: "approved" };
      }

      if (pr.reviewDecision === "CHANGES_REQUESTED") {
        return { bucket: "changes-requested", label: "changes requested" };
      }

      if (pr.reviewDecision === "REVIEW_REQUIRED") {
        return { bucket: "not-reviewed", label: "review required" };
      }

      return { bucket: "not-reviewed", label: "not reviewed" };
    };

    const formatDate = (value) => new Date(value).toLocaleString();
    const formatDiff = (pr) => pr.changedFiles + " files · +" + pr.additions + " / -" + pr.deletions;

    const searchableText = (pr) => {
      const review = reviewMeta(pr);
      return [
        pr.number,
        pr.title,
        pr.headRefName,
        pr.baseRefName,
        pr.author && pr.author.login ? "@" + pr.author.login : "",
        review.label,
        review.bucket.replaceAll("-", " "),
        pr.changedFiles,
      ].join(" ").toLowerCase();
    };

    const matchesBranch = (id, query) => {
      if (!query) return true;
      const pr = byId.get(id);
      if (searchableText(pr).includes(query)) return true;
      return childrenOf(id).some((childId) => matchesBranch(childId, query));
    };

    const countVisible = (ids, query, stack = new Set()) => {
      let total = 0;
      for (const id of ids) {
        if (stack.has(id) || !matchesBranch(id, query)) continue;
        const next = new Set(stack);
        next.add(id);
        total += 1 + countVisible(childrenOf(id), query, next);
      }
      return total;
    };

    const maxDepth = (ids, stack = new Set()) => {
      if (ids.length === 0) return 0;
      return Math.max(...ids.map((id) => {
        if (stack.has(id)) return 0;
        const next = new Set(stack);
        next.add(id);
        return 1 + maxDepth(childrenOf(id), next);
      }));
    };

    const lineageFor = (id) => {
      const lineage = [];
      const seen = new Set();
      let current = id;

      while (current && !seen.has(current) && byId.has(current)) {
        lineage.unshift(current);
        seen.add(current);
        current = parentMap.get(current);
      }

      return lineage;
    };

    const collectSubtree = (id, stack = new Set()) => {
      if (stack.has(id) || !byId.has(id)) {
        return [];
      }

      const next = new Set(stack);
      next.add(id);
      return [
        id,
        ...childrenOf(id).flatMap((childId) => collectSubtree(childId, next)),
      ];
    };

    const visibleRoots = (query) => {
      if (!data) {
        return [];
      }

      if (state.focusId && byId.has(state.focusId)) {
        return matchesBranch(state.focusId, query) ? [state.focusId] : [];
      }

      return data.componentRoots.filter((id) => matchesBranch(id, query));
    };

    const selectedPr = () => {
      if (state.selectedId && byId.has(state.selectedId)) {
        return byId.get(state.selectedId);
      }

      const firstVisible = visibleRoots(state.query.trim().toLowerCase())[0];
      return firstVisible ? byId.get(firstVisible) : null;
    };

    const renderStats = (query) => {
      if (!data) {
        statsEl.replaceChildren();
        return;
      }

      const roots = visibleRoots(query);
      const reviewed = data.prs.filter((pr) => {
        const review = reviewMeta(pr);
        return matchesBranch(pr.number, query) && (review.bucket === "reviewed" || review.bucket === "changes-requested");
      }).length;
      const notReviewed = data.prs.filter((pr) => {
        const review = reviewMeta(pr);
        return matchesBranch(pr.number, query) && (review.bucket === "not-reviewed" || review.bucket === "draft");
      }).length;

      const stats = [
        ["visible prs", countVisible(roots, query)],
        ["root branches", roots.length],
        ["max depth", maxDepth(roots)],
        ["reviewed", reviewed],
        ["not reviewed", notReviewed],
      ];

      statsEl.replaceChildren(...stats.map(([label, value]) => {
        const box = document.createElement("div");
        box.className = "stat";
        const strong = document.createElement("strong");
        strong.textContent = value;
        const span = document.createElement("span");
        span.textContent = label;
        box.append(strong, span);
        return box;
      }));
    };

    const pill = (label, className = "") => {
      const el = document.createElement("span");
      el.className = "pill" + (className ? " " + className : "");
      el.textContent = label;
      return el;
    };

    const renderDetail = () => {
      if (!data) {
        detailEl.innerHTML = '<div class="detail-block"><h3 class="detail-title">Selection</h3><div class="empty">Loading details...</div></div>';
        return;
      }

      const pr = selectedPr();
      if (!pr) {
        detailEl.innerHTML = '<div class="detail-block"><h3 class="detail-title">Selection</h3><div class="empty">No PR selected.</div></div>';
        return;
      }

      state.selectedId = pr.number;
      const subtreeIds = collectSubtree(pr.number);
      const review = reviewMeta(pr);
      const lineage = lineageFor(pr.number).map((id) => byId.get(id));
      const timeline = [
        { label: "Created", at: pr.createdAt, detail: "PR opened" },
        ...pr.latestReviews.map((item) => ({
          label: item.state.replaceAll("_", " ").toLowerCase(),
          at: item.submittedAt,
          detail: item.author && item.author.login ? "@" + item.author.login : "review",
        })),
        { label: "Updated", at: pr.updatedAt, detail: "latest push/update" },
      ].sort((a, b) => new Date(b.at) - new Date(a.at));

      const exportLines = subtreeIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((item) => item.url)
        .join("\\n");

      detailEl.replaceChildren();

      const header = document.createElement("section");
      header.className = "detail-block detail-head";
      header.innerHTML = \`
        <div class="eyebrow">selected pr</div>
        <h2><a href="\${pr.url}" target="_blank" rel="noreferrer">#\${pr.number} \${pr.title}</a></h2>
      \`;
      const headerMeta = document.createElement("div");
      headerMeta.className = "meta";
      headerMeta.append(
        pill(pr.author && pr.author.login ? "@" + pr.author.login : "@unknown"),
        pill(review.label, "review-" + review.bucket),
        pill(formatDiff(pr)),
        state.focusId === pr.number ? pill("focused", "focused") : pill(pr.headRefName + " -> " + pr.baseRefName),
      );
      header.appendChild(headerMeta);
      detailEl.appendChild(header);

      const actions = document.createElement("section");
      actions.className = "detail-block detail-actions";

      const focusButton = document.createElement("button");
      focusButton.className = "action wide";
      focusButton.textContent = state.focusId === pr.number ? "Clear focus mode" : "Focus this subtree";
      focusButton.addEventListener("click", () => {
        state.focusId = state.focusId === pr.number ? null : pr.number;
        render();
      });

      const collapseButton = document.createElement("button");
      collapseButton.className = "action wide";
      collapseButton.textContent = state.collapsed.has(pr.number) ? "Expand subtree" : "Collapse subtree";
      collapseButton.addEventListener("click", () => {
        if (state.collapsed.has(pr.number)) {
          state.collapsed.delete(pr.number);
        } else {
          state.collapsed.add(pr.number);
        }
        render();
      });

      const batchButton = document.createElement("button");
      batchButton.className = "action wide";
      batchButton.textContent = "Open review batch (" + subtreeIds.length + ")";
      batchButton.addEventListener("click", () => {
        subtreeIds
          .map((id) => byId.get(id))
          .filter(Boolean)
          .forEach((item) => window.open(item.url, "_blank", "noopener"));
      });

      const copyBranchButton = document.createElement("button");
      copyBranchButton.className = "action wide";
      copyBranchButton.textContent = "Copy branch name";
      copyBranchButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(pr.headRefName);
      });

      const copyButton = document.createElement("button");
      copyButton.className = "action wide";
      copyButton.textContent = "Copy link list";
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(exportLines);
      });

      actions.append(focusButton, collapseButton, batchButton, copyBranchButton, copyButton);
      detailEl.appendChild(actions);

      const facts = document.createElement("section");
      facts.className = "detail-block";
      facts.innerHTML = '<h3 class="detail-title">Review facts</h3>';
      const factsList = document.createElement("div");
      factsList.className = "detail-list";
      [
        ["Branch", pr.headRefName],
        ["Changed", formatDiff(pr)],
        ["Created", formatDate(pr.createdAt)],
        ["Updated", formatDate(pr.updatedAt)],
        ["Subtree size", subtreeIds.length + " PRs"],
      ].forEach(([label, value]) => {
        const row = document.createElement("div");
        row.className = "detail-row";
        row.innerHTML = '<span>' + label + '</span><strong>' + value + '</strong>';
        factsList.appendChild(row);
      });
      facts.appendChild(factsList);
      detailEl.appendChild(facts);

      const lineageBlock = document.createElement("section");
      lineageBlock.className = "detail-block";
      lineageBlock.innerHTML = '<h3 class="detail-title">Focus path</h3>';
      const lineageList = document.createElement("div");
      lineageList.className = "detail-list";
      lineage.forEach((item) => {
        const row = document.createElement("div");
        row.className = "lineage-item";
        row.innerHTML = '<strong>#' + item.number + '</strong>' + item.title;
        lineageList.appendChild(row);
      });
      lineageBlock.appendChild(lineageList);
      detailEl.appendChild(lineageBlock);

      const timelineBlock = document.createElement("section");
      timelineBlock.className = "detail-block";
      timelineBlock.innerHTML = '<h3 class="detail-title">Mini timeline</h3>';
      const timelineList = document.createElement("div");
      timelineList.className = "timeline";
      timeline.forEach((item) => {
        const row = document.createElement("div");
        row.className = "timeline-item";
        row.innerHTML = '<strong>' + item.label + '</strong>' + item.detail + '<br>' + formatDate(item.at);
        timelineList.appendChild(row);
      });
      timelineBlock.appendChild(timelineList);
      detailEl.appendChild(timelineBlock);

      const exportBlock = document.createElement("section");
      exportBlock.className = "detail-block";
      exportBlock.innerHTML = '<h3 class="detail-title">Export/share</h3>';
      const exportBox = document.createElement("div");
      exportBox.className = "export-box mono";
      exportBox.textContent = exportLines;
      exportBlock.appendChild(exportBox);
      detailEl.appendChild(exportBlock);
    };

    const renderPrCard = (id, options = {}) => {
      const pr = byId.get(id);
      const review = reviewMeta(pr);
      const card = document.createElement("article");
      card.className = "pr-card" + (state.selectedId === id ? " is-selected" : "") + (options.isRoot ? " root-card" : "");
      card.addEventListener("click", () => {
        state.selectedId = id;
        render();
      });

      const top = document.createElement("div");
      top.className = "pr-top";

      const title = document.createElement("h2");
      title.className = "pr-title";
      const titleLink = document.createElement("a");
      titleLink.href = pr.url;
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
      titleLink.textContent = "#" + pr.number + " " + pr.title;
      titleLink.addEventListener("click", (event) => event.stopPropagation());
      title.appendChild(titleLink);

      const topRight = document.createElement("div");
      topRight.style.display = "flex";
      topRight.style.alignItems = "center";
      const prLink = document.createElement("a");
      prLink.className = "pr-link mono";
      prLink.href = pr.url;
      prLink.target = "_blank";
      prLink.rel = "noreferrer";
      prLink.textContent = "open";
      prLink.addEventListener("click", (event) => event.stopPropagation());
      topRight.appendChild(prLink);

      const kids = childrenOf(id).filter((childId) => matchesBranch(childId, options.query ?? ""));
      if (kids.length > 0) {
        const toggle = document.createElement("button");
        toggle.className = "toggle mono";
        toggle.textContent = state.collapsed.has(id) ? "+" : "−";
        toggle.addEventListener("click", (event) => {
          event.stopPropagation();
          if (state.collapsed.has(id)) {
            state.collapsed.delete(id);
          } else {
            state.collapsed.add(id);
          }
          render();
        });
        topRight.appendChild(toggle);
      }

      top.append(title, topRight);
      card.appendChild(top);

      const meta = document.createElement("div");
      meta.className = "meta";
      const bits = [
        pill(pr.headRefName + " -> " + pr.baseRefName),
        pill(pr.author && pr.author.login ? "@" + pr.author.login : "@unknown"),
        pill(review.label, "review-" + review.bucket),
        pill(formatDiff(pr)),
      ];
      if (options.parentId) {
        bits.push(pill("from #" + options.parentId));
      }
      meta.append(...bits);
      card.appendChild(meta);

      return card;
    };

    const renderBranch = (id, query, options = {}) => {
      const shell = document.createElement("div");
      shell.className = "node-shell";
      shell.appendChild(renderPrCard(id, {
        isRoot: options.isRoot ?? false,
        parentId: options.parentId ?? null,
        query,
      }));

      if (state.collapsed.has(id)) {
        return shell;
      }

      const stack = options.stack ?? new Set();
      const nextStack = new Set(stack);
      nextStack.add(id);

      const visibleChildren = childrenOf(id)
        .filter((childId) => matchesBranch(childId, query));

      if (visibleChildren.length === 0) {
        return shell;
      }

      const childStack = document.createElement("div");
      childStack.className = "children-stack" + (options.isRoot ? " root-stack" : "");

      visibleChildren.forEach((childId) => {
        const branch = document.createElement("div");
        branch.className = "child-branch";

        if (nextStack.has(childId)) {
          const cycle = document.createElement("div");
          cycle.className = "cycle-note mono";
          cycle.textContent = "cycle to #" + childId;
          branch.appendChild(cycle);
        } else {
          branch.appendChild(renderBranch(childId, query, {
            parentId: id,
            stack: nextStack,
          }));
        }

        childStack.appendChild(branch);
      });

      shell.appendChild(childStack);
      return shell;
    };

    const renderRootSection = (rootId, query) => {
      const section = document.createElement("div");
      section.className = "root-section";
      section.appendChild(renderBranch(rootId, query, { isRoot: true }));
      return section;
    };

    const render = () => {
      if (!data) {
        treeEl.replaceChildren();
        renderDetail();
        return;
      }

      const query = state.query.trim().toLowerCase();
      const roots = visibleRoots(query);
      renderStats(query);

      if (!state.selectedId || !byId.has(state.selectedId)) {
        state.selectedId = roots[0] ?? null;
      }

      if (roots.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No PRs match this filter.";
        treeEl.replaceChildren(empty);
        renderDetail();
        return;
      }

      const hub = document.createElement("div");
      hub.className = "node-shell hub";

      const rootCard = document.createElement("article");
      rootCard.className = "pr-card root-card";
      rootCard.innerHTML = \`
        <div class="pr-top">
          <div>
            <div class="eyebrow">\${state.focusId ? "focus mode" : "root"}</div>
            <h2 class="pr-title">\${state.focusId ? "Focused subtree" : "Open PR Graph"}</h2>
          </div>
        </div>
        <div class="meta">
          <span class="pill">\${countVisible(roots, query)} PRs</span>
          <span class="pill">\${roots.length} root branches</span>
          <span class="pill">depth \${maxDepth(roots)}</span>
          \${state.focusId ? '<span class="pill focused">focused</span>' : ""}
        </div>
      \`;
      hub.appendChild(rootCard);

      const stackEl = document.createElement("div");
      stackEl.className = "children-stack root-stack";

      for (const rootId of roots) {
        const branch = document.createElement("div");
        branch.className = "child-branch";
        branch.appendChild(renderRootSection(rootId, query));
        stackEl.appendChild(branch);
      }

      hub.appendChild(stackEl);
      treeEl.replaceChildren(hub);
      renderDetail();
    };

    const loadData = async () => {
      setLoading(
        true,
        demoMode
          ? "Loading demo graph fixture for README screenshot."
          : data
            ? "Refreshing graph from GitHub."
            : "Pulling live repo and PR data from GitHub.",
      );
      generatedEl.textContent = "loading live PR data...";

      try {
        const response = await fetch(
          "/api/data?ts=" + Date.now() + (demoMode ? "&demo=1" : ""),
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        data = await response.json();
        if (data.repo && data.repo.nameWithOwner) {
          repoLinkEl.textContent = data.repo.nameWithOwner;
          repoLinkEl.href = data.repo.url || "#";
          document.title = (data.repo.name || data.repo.nameWithOwner) + " PR Tree";
        }
        byId = new Map(data.prs.map((pr) => [pr.number, pr]));
        childMap = data.children;
        parentMap = new Map();
        Object.entries(childMap).forEach(([parent, kids]) => {
          kids.forEach((childId) => {
            if (!parentMap.has(childId)) {
              parentMap.set(childId, Number(parent));
            }
          });
        });
        if (state.selectedId && !byId.has(state.selectedId)) {
          state.selectedId = null;
        }
        if (state.focusId && !byId.has(state.focusId)) {
          state.focusId = null;
        }
        generatedEl.textContent = demoMode
          ? "demo fixture · screenshot-safe"
          : "generated " + new Date(data.generatedAt).toLocaleString();
        render();
        setLoading(false);
      } catch (error) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Failed to load live PR data: " + error.message;
        treeEl.replaceChildren(empty);
        generatedEl.textContent = "refresh failed";
        setLoading(false, "Load failed. Check GitHub auth or network, then refresh.");
      }
    };

    document.getElementById("refresh").addEventListener("click", () => loadData());
    document.getElementById("reset").addEventListener("click", () => {
      state.query = "";
      state.focusId = null;
      searchEl.value = "";
      render();
    });
    searchEl.addEventListener("input", (event) => {
      state.query = event.target.value;
      render();
    });

    render();
    loadData();
  </script>
</body>
</html>`;
}

function openTarget(target) {
	execFileSync("open", [target]);
}

function writeAndOpenFile(filename, contents) {
	const outputPath = path.join(process.cwd(), filename);
	writeFileSync(outputPath, contents, "utf8");
	openTarget(outputPath);
	return outputPath;
}

function startServer(port, options = {}) {
	const server = http.createServer((request, response) => {
		if (!request.url) {
			response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("Bad request");
			return;
		}

		const url = new URL(request.url, `http://127.0.0.1:${port}`);

		if (url.pathname === "/health") {
			response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("ok");
			return;
		}

		if (url.pathname === "/api/data") {
			try {
				const payload = getGraphPayload({
					demo: options.demo || url.searchParams.get("demo") === "1",
				});
				response.writeHead(200, {
					"Content-Type": "application/json; charset=utf-8",
					"Cache-Control": "no-store",
				});
				response.end(JSON.stringify(payload));
			} catch (error) {
				response.writeHead(500, {
					"Content-Type": "application/json; charset=utf-8",
				});
				response.end(JSON.stringify({ error: error.message }));
			}
			return;
		}

		if (url.pathname === "/" || url.pathname === "/index.html") {
			response.writeHead(200, {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "no-store",
			});
			response.end(renderHtml({ demo: options.demo || url.searchParams.get("demo") === "1" }));
			return;
		}

		response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Not found");
	});

	return new Promise((resolve, reject) => {
		server.once("error", (error) => {
			if (error.code === "EADDRINUSE") {
				reject(
					new Error(
						`Port ${port} is already in use. Stop the existing pr-tree process or use --port=<port>.`,
					),
				);
				return;
			}

			reject(error);
		});

		server.listen(port, "127.0.0.1", () => {
			resolve(server);
		});
	});
}

function parseArgs(argv) {
	const portArg = argv.find((arg) => arg.startsWith("--port="));
	return {
		help: argv.includes("--help") || argv.includes("-h"),
		demo: argv.includes("--demo"),
		port: portArg
			? Number.parseInt(portArg.slice("--port=".length), 10)
			: SERVER_PORT,
		format: argv.includes("--text")
			? "text"
			: argv.includes("--svg")
				? "svg"
				: argv.includes("--dot")
					? "dot"
					: "html",
	};
}

function printHelp() {
	console.log(`Usage:
  node tool/pr-tree.js
  node tool/pr-tree.js --text
  node tool/pr-tree.js --dot
  node tool/pr-tree.js --html
  node tool/pr-tree.js --svg
  node tool/pr-tree.js --demo

Options:
  --text  Print the plain-text tree to stdout.
  --dot   Print Graphviz DOT to stdout.
  --html  Open the live local HTML app in the default browser.
  --svg   Generate ./pr-tree.svg and open it in the default browser.
  --demo  Use fixed sample PR data for screenshots and local previews.
  --help  Show this help.

Notes:
  Default mode is --html.
  --html starts a local server in the foreground. Ctrl-C stops it.
  Refresh in the page pulls live data from GitHub.
  Graphviz is required for --svg.
  Install Graphviz on macOS with:
    brew install graphviz`);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printHelp();
		return;
	}

	if (options.format === "html") {
		const server = await startServer(options.port, options);
		const target = `http://127.0.0.1:${options.port}`;
		openTarget(target);
		console.log(`Opened ${target}`);
		console.log("Server attached. Ctrl-C to stop.");

		const shutdown = () => {
			server.close(() => {
				process.exit(0);
			});
		};

		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);
		return;
	}

	const payload = getGraphPayload(options);
	const prs = payload.prs;
	const { roots, children } = buildForest(prs);

	if (options.format === "svg") {
		const svg = renderSvg(prs, roots, children);
		const outputPath = writeAndOpenFile("pr-tree.svg", svg);
		console.log(`Created ${outputPath}`);
		return;
	}

	const lines =
		options.format === "dot"
			? renderDot(prs, roots, children)
			: renderForest(prs, roots, children);

	for (const line of lines) {
		console.log(line);
	}
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message);
		process.exit(1);
	});
}

module.exports = {
	buildForest,
	formatNode,
	getDemoPRs,
	getDemoRepoInfo,
	getGraphPayload,
	getComponentRoots,
	getPRs,
	getRepoInfo,
	makeDotLabel,
	parseArgs,
	printHelp,
	renderDot,
	renderForest,
	renderHtml,
	renderSvg,
	serializeGraph,
	startServer,
	openTarget,
	writeAndOpenFile,
};
