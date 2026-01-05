#!/usr/bin/env node
/*
  Generate harmonization planning artifacts from the pinned baseline snapshot set.

  Outputs into: docs/devdocs/fig-bin/_inventory/
    - mode-rename-proposal.json
    - alias-missing-local-report.soloist-os-plugin.json

  Inputs:
    - docs/devdocs/fig-bin/_inventory/baseline-manifest.json
    - docs/devdocs/fig-bin/_inventory/latest-findings.json

  Note: This is intentionally "proposal" output (no mutations).
*/

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	".."
);
const invDir = path.join(repoRoot, "docs", "devdocs", "fig-bin", "_inventory");

const baselineManifestPath = path.join(invDir, "baseline-manifest.json");
const findingsPath = path.join(invDir, "latest-findings.json");

const outModeRenamePath = path.join(invDir, "mode-rename-proposal.json");
const outAliasReportPath = path.join(
	invDir,
	"alias-missing-local-report.soloist-os-plugin.json"
);

function readJson(p) {
	return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(p) {
	if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function nowIso() {
	return new Date().toISOString();
}

function indexBaselineByFileName(baselineManifest) {
	const map = new Map();
	for (const f of baselineManifest?.files ?? []) {
		map.set(f.fileName, f);
	}
	return map;
}

function loadSnapshotByRelativePath(relPath) {
	const abs = path.join(repoRoot, relPath);
	return readJson(abs);
}

function getCollections(snapshot) {
	return Array.isArray(snapshot?.collections) ? snapshot.collections : [];
}

function getVariables(snapshot) {
	return Array.isArray(snapshot?.variables) ? snapshot.variables : [];
}

function getCollectionModeFacts(collections, collectionId) {
	const col = collections.find((c) => c?.id === collectionId);
	const colModes = Array.isArray(col?.modes) ? col.modes : [];
	return {
		collectionFound: Boolean(col),
		modes: colModes,
		onlyOneMode: colModes.length === 1,
		hasDefaultNameAlready: colModes.some((x) => x?.name === "Default"),
	};
}

function makeRenameChange({
	fileName,
	snapshotPath,
	collectionId,
	collectionName,
	modeId,
	fromName,
	toName,
	confidence,
	reason,
	warnings,
}) {
	return {
		fileName,
		snapshotPath,
		collectionId,
		collectionName,
		modeId,
		fromName,
		toName,
		confidence,
		reason,
		warnings,
	};
}

function proposeRenameForMode1({ fileName, snapshotPath, collections, mode1 }) {
	const facts = getCollectionModeFacts(collections, mode1.collectionId);
	const base = {
		fileName,
		snapshotPath,
		collectionId: mode1.collectionId,
		collectionName: mode1.collectionName,
		modeId: mode1.modeId,
		fromName: mode1.modeName,
	};

	if (facts.hasDefaultNameAlready) {
		return makeRenameChange({
			...base,
			toName: null,
			confidence: "blocked",
			reason: 'Collection already contains a mode named "Default"; renaming "Mode 1" to "Default" would collide. Choose an alternative name.',
			warnings: ["name-collision:Default"],
		});
	}

	return makeRenameChange({
		...base,
		toName: "Default",
		confidence: facts.onlyOneMode ? "high" : "medium",
		reason: facts.onlyOneMode
			? 'Single-mode collection; renaming "Mode 1" to "Default" improves clarity without changing semantics.'
			: 'Multi-mode collection; "Mode 1" is likely acting as a default mode. Rename improves clarity but should be reviewed.',
		warnings: facts.collectionFound
			? []
			: ["collection-not-found-in-snapshot"],
	});
}

function proposeModeRenamesForRow({ row, baselineByFileName }) {
	const baseline = baselineByFileName.get(row.fileName);
	const snapshotPath = baseline?.snapshotPath ?? row.snapshotPath;
	if (!snapshotPath) return [];

	const snap = loadSnapshotByRelativePath(snapshotPath);
	const collections = getCollections(snap);
	const out = [];
	for (const mode1 of row?.mode1Modes ?? []) {
		out.push(
			proposeRenameForMode1({
				fileName: row.fileName,
				snapshotPath,
				collections,
				mode1,
			})
		);
	}
	return out;
}

function proposeModeRenames({ baselineByFileName, findings }) {
	const changes = (findings?.rows ?? []).flatMap((row) =>
		proposeModeRenamesForRow({ row, baselineByFileName })
	);

	// Deterministic ordering helps diffs.
	changes.sort((a, b) => {
		const fa = String(a.fileName).localeCompare(String(b.fileName));
		if (fa) return fa;
		const ca = String(a.collectionName).localeCompare(
			String(b.collectionName)
		);
		if (ca) return ca;
		return String(a.modeId).localeCompare(String(b.modeId));
	});

	const byFile = {};
	for (const c of changes) {
		byFile[c.fileName] = byFile[c.fileName] ?? {
			total: 0,
			actionable: 0,
			blocked: 0,
		};
		byFile[c.fileName].total++;
		if (c.confidence === "blocked" || c.toName === null)
			byFile[c.fileName].blocked++;
		else byFile[c.fileName].actionable++;
	}

	return { changes, summaryByFile: byFile };
}

function isAliasValue(value) {
	return (
		value &&
		typeof value === "object" &&
		value.type === "VARIABLE_ALIAS" &&
		typeof value.id === "string"
	);
}

function getOrCreateTargetBucket(byTarget, targetId) {
	if (!byTarget.has(targetId))
		byTarget.set(targetId, { targetId, refCount: 0, variables: new Map() });
	return byTarget.get(targetId);
}

function getOrCreateTargetVarEntry({ bucket, variable, collectionNameById }) {
	const varId = variable?.id ?? "(unknown-variable-id)";
	if (!bucket.variables.has(varId)) {
		bucket.variables.set(varId, {
			variableId: varId,
			variableName: variable?.name ?? "(unknown)",
			variableCollectionId: variable?.variableCollectionId ?? null,
			variableCollectionName:
				collectionNameById.get(variable?.variableCollectionId) ??
				variable?.variableCollectionId ??
				null,
			modes: [],
		});
	}
	return bucket.variables.get(varId);
}

function accumulateMissingAliasTargets({
	variables,
	localIdSet,
	collectionNameById,
}) {
	/** @type {Map<string, {targetId: string, refCount: number, variables: Map<string, any>}>} */
	const byTarget = new Map();

	for (const v of variables) {
		const valuesByMode = v?.valuesByMode ?? {};
		for (const modeId in valuesByMode) {
			const value = valuesByMode[modeId];
			if (!isAliasValue(value)) continue;
			if (localIdSet.has(value.id)) continue;

			const bucket = getOrCreateTargetBucket(byTarget, value.id);
			bucket.refCount++;

			const entry = getOrCreateTargetVarEntry({
				bucket,
				variable: v,
				collectionNameById,
			});
			entry.modes.push(modeId);
		}
	}

	return byTarget;
}

function computeAliasMissingLocalReport({ baselineByFileName }) {
	const baseline = baselineByFileName.get("Soloist OS Plugin");
	if (!baseline?.snapshotPath) {
		throw new Error(
			"Soloist OS Plugin not found in baseline-manifest.json"
		);
	}

	const snap = loadSnapshotByRelativePath(baseline.snapshotPath);
	const variables = getVariables(snap);
	const collections = getCollections(snap);

	const localIdSet = new Set(variables.map((v) => v?.id).filter(Boolean));
	const collectionNameById = new Map(collections.map((c) => [c.id, c.name]));

	const byTarget = accumulateMissingAliasTargets({
		variables,
		localIdSet,
		collectionNameById,
	});

	const targets = [...byTarget.values()]
		.map((t) => ({
			targetId: t.targetId,
			refCount: t.refCount,
			affectedVariables: [...t.variables.values()].map((v) => ({
				...v,
				modes: [...new Set(v.modes)].sort(),
			})),
		}))
		.sort((a, b) => b.refCount - a.refCount);

	const totalRefs = targets.reduce((a, t) => a + t.refCount, 0);
	const uniqueTargets = targets.length;
	const uniqueVariables = new Set(
		targets.flatMap((t) => t.affectedVariables.map((v) => v.variableId))
	).size;

	return {
		schemaVersion: "soloist-os.harmonization.alias-missing-local-report.v1",
		generatedAt: nowIso(),
		fileName: "Soloist OS Plugin",
		snapshotPath: baseline.snapshotPath,
		exportedAt: snap?.meta?.exportedAt ?? null,
		totals: {
			totalMissingLocalAliasRefs: totalRefs,
			uniqueMissingLocalTargetIds: uniqueTargets,
			uniqueVariablesReferencingMissingTargets: uniqueVariables,
		},
		targets,
		recommendedStrategies: [
			{
				key: "localize",
				label: "Make aliases self-contained",
				when: "Best for portability / cross-file refactors",
				steps: [
					"Identify which library/file owns each missing targetId",
					"Create equivalent local variables in the target file",
					"Repoint aliases to the new local variable IDs",
				],
			},
			{
				key: "explicit-dependency",
				label: "Make library dependency explicit",
				when: "Best when a shared published variable library is the source of truth",
				steps: [
					"Ensure the external variable library is published and attached",
					"Avoid “harvested” references by re-linking to the published source",
					"Document the dependency in repo docs",
				],
			},
			{
				key: "bake-values",
				label: "Replace aliases with literal values",
				when: "Best for one-off tokens that should not follow upstream changes",
				steps: [
					"Resolve alias values per mode",
					"Write literal values into the variable modes",
				],
			},
		],
	};
}

function main() {
	ensureDir(invDir);
	const baselineManifest = readJson(baselineManifestPath);
	const findings = readJson(findingsPath);
	const baselineByFileName = indexBaselineByFileName(baselineManifest);

	const modeRenames = proposeModeRenames({ baselineByFileName, findings });
	const modeRenameDoc = {
		schemaVersion: "soloist-os.harmonization.mode-rename-proposal.v1",
		generatedAt: nowIso(),
		baseline: {
			manifestPath: path.relative(repoRoot, baselineManifestPath),
			findingsPath: path.relative(repoRoot, findingsPath),
			selectionPolicy: baselineManifest?.policy?.selection ?? "unknown",
			uniqueFileNamesExpected:
				baselineManifest?.policy?.uniqueFileNamesExpected ?? null,
		},
		summaryByFile: modeRenames.summaryByFile,
		changes: modeRenames.changes,
	};
	fs.writeFileSync(outModeRenamePath, JSON.stringify(modeRenameDoc, null, 2));

	const aliasReport = computeAliasMissingLocalReport({ baselineByFileName });
	fs.writeFileSync(outAliasReportPath, JSON.stringify(aliasReport, null, 2));

	console.log("Wrote proposals:");
	console.log("  - " + path.relative(repoRoot, outModeRenamePath));
	console.log("  - " + path.relative(repoRoot, outAliasReportPath));
}

main();
