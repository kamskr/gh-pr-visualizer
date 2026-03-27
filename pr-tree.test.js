const test = require("node:test");
const assert = require("node:assert/strict");

const { renderHtml, serializeGraph } = require("./pr-tree");

test("renderHtml uses generic copy", () => {
	const html = renderHtml();
	assert.ok(html.includes("search: PR-4910, feature-branch, @kamskr, approved, review required"));
	assert.ok(html.includes('class="repo-link"'));
	assert.ok(html.includes('id="repo-link"'));
	assert.ok(html.includes('id="loading-screen"'));
	assert.ok(html.includes("Loading PR graph"));
	assert.ok(html.includes('const setLoading = (active, message = "Pulling live repo and PR data from GitHub.") => {'));
	assert.ok(html.includes('repoLinkEl.textContent = data.repo.nameWithOwner;'));
	assert.ok(html.includes('repoLinkEl.href = data.repo.url || "#";'));
});

test("serializeGraph includes repo metadata", () => {
	const graph = serializeGraph([], [], new Map(), {
		name: "gh-pr-visualizer",
		nameWithOwner: "kamskr/gh-pr-visualizer",
		url: "https://github.com/kamskr/gh-pr-visualizer",
	});

	assert.deepEqual(graph.repo, {
		name: "gh-pr-visualizer",
		nameWithOwner: "kamskr/gh-pr-visualizer",
		url: "https://github.com/kamskr/gh-pr-visualizer",
	});
});
