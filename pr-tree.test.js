const test = require("node:test");
const assert = require("node:assert/strict");

const {
	buildForest,
	getDemoPRs,
	getGraphPayload,
	parseArgs,
	renderHtml,
	serializeGraph,
} = require("./pr-tree");

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

test("renderHtml can boot in demo mode", () => {
	const html = renderHtml({ demo: true });
	assert.ok(html.includes("const demoMode = true;"));
	assert.ok(html.includes("Loading demo graph fixture for README screenshot."));
	assert.ok(html.includes('"/api/data?ts=" + Date.now() + (demoMode ? "&demo=1" : "")'));
});

test("getGraphPayload returns sample data in demo mode", () => {
	const graph = getGraphPayload({ demo: true });
	const demoPRs = getDemoPRs();
	const { roots, children } = buildForest(demoPRs);

	assert.equal(graph.repo.nameWithOwner, "kamskr/demo-stacked-prs");
	assert.equal(graph.prs.length, demoPRs.length);
	assert.deepEqual(
		graph.componentRoots.map((id) => Number(id)),
		[101, 110],
	);
	assert.equal(demoPRs.length, 14);
	assert.deepEqual(
		roots.map((pr) => pr.number),
		[101, 110],
	);
	assert.deepEqual(
		(children.get(103) ?? []).map((pr) => pr.number),
		[104, 105],
	);
	assert.deepEqual(
		(children.get(110) ?? []).map((pr) => pr.number),
		[111],
	);
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

test("parseArgs supports demo mode", () => {
	assert.deepEqual(parseArgs(["--demo"]), {
		help: false,
		demo: true,
		port: 43123,
		format: "html",
	});
});
