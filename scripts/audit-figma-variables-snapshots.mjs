#!/usr/bin/env node
/*
  Soloist OS – Figma Variables Snapshot Auditor

  Scans: docs/devdocs/fig-bin/<file>/variables-snapshot*.json (recursively)

  Prints a human-friendly summary per snapshot and a few sanity checks:
  - counts match
  - collection IDs referenced by variables exist
  - highlights suspicious mode names like "Mode 1"
*/

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	".."
);
const figBinRoot = path.join(repoRoot, "docs", "devdocs", "fig-bin");
const inventoryOutDir = path.join(figBinRoot, "_inventory");
const findingsOutPath = path.join(inventoryOutDir, "latest-findings.json");

function isDir(p) {
	try {
		return fs.statSync(p).isDirectory();
	} catch {
		return false;
	}
}

function listJsonSnapshots(dirPath) {
	const out = [];
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	for (const ent of entries) {
		const full = path.join(dirPath, ent.name);
		if (ent.isDirectory()) {
			out.push(...listJsonSnapshots(full));
		} else if (
			ent.isFile() &&
			ent.name.toLowerCase().endsWith(".json") &&
			ent.name.startsWith("variables-snapshot")
		) {
			out.push(full);
		}
	}
	return out;
}

function readJson(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");
	return JSON.parse(raw);
}

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function toCsv(rows) {
	const escape = (v) => {
		const s = String(v ?? "");
		if (s.includes('"') || s.includes(",") || s.includes("\n")) {
			return '"' + s.replaceAll('"', '""') + '"';
		}
		return s;
	};
	if (!rows.length) return "";
	const headers = Object.keys(rows[0]);
	const lines = [];
	lines.push(headers.map(escape).join(","));
	for (const r of rows) {
		lines.push(headers.map((h) => escape(r[h])).join(","));
	}
	return lines.join("\n") + "\n";
}

function padRight(s, n) {
	const str = String(s);
	if (str.length >= n) return str;
	return str + " ".repeat(n - str.length);
}

function getCollections(snap) {
	return Array.isArray(snap?.collections) ? snap.collections : [];
}

function getVariables(snap) {
	return Array.isArray(snap?.variables) ? snap.variables : [];
}

function isColorObject(x) {
	return (
		x &&
		typeof x === "object" &&
		typeof x.r === "number" &&
		typeof x.g === "number" &&
		typeof x.b === "number"
	);
}

function isAlias(x) {
	return (
		x &&
		typeof x === "object" &&
		x.type === "VARIABLE_ALIAS" &&
		typeof x.id === "string"
	);
}

function isValueShapeOk(resolvedType, value) {
	if (resolvedType === "FLOAT") return typeof value === "number";
	if (resolvedType === "BOOLEAN") return typeof value === "boolean";
	if (resolvedType === "STRING") return typeof value === "string";
	if (resolvedType === "COLOR") return isColorObject(value);
	// Other resolved types exist; if unknown, skip.
	return true;
}

function computeHiddenFromPublishing(variables) {
	const hiddenByCollectionId = {};
	let hiddenTotal = 0;

	for (const v of variables) {
		if (!v?.hiddenFromPublishing) continue;
		hiddenTotal++;
		const colId = v?.variableCollectionId ?? "UNKNOWN";
		hiddenByCollectionId[colId] = (hiddenByCollectionId[colId] ?? 0) + 1;
	}

	return { hiddenByCollectionId, hiddenTotal };
}

function computeAliasMissingLocalTargets(variables, variableIdSet) {
	let aliasMissingLocalTarget = 0;
	const aliasMissingSamples = [];

	for (const v of variables) {
		const valuesByMode = v?.valuesByMode ?? {};
		for (const modeId in valuesByMode) {
			const value = valuesByMode[modeId];
			if (!isAlias(value)) continue;
			if (variableIdSet.has(value.id)) continue;

			aliasMissingLocalTarget++;
			if (aliasMissingSamples.length < 10) {
				aliasMissingSamples.push({
					name: v?.name,
					modeId,
					targetId: value.id,
				});
			}
		}
	}

	return { aliasMissingLocalTarget, aliasMissingSamples };
}

function computeValueShapeMismatches(variables) {
	let valueShapeMismatch = 0;
	const mismatchSamples = [];

	for (const v of variables) {
		const resolvedType = v?.resolvedType;
		const valuesByMode = v?.valuesByMode ?? {};
		for (const modeId in valuesByMode) {
			const value = valuesByMode[modeId];
			const isMismatch =
				!isAlias(value) && !isValueShapeOk(resolvedType, value);
			if (!isMismatch) continue;

			valueShapeMismatch++;
			if (mismatchSamples.length < 10) {
				mismatchSamples.push({
					name: v?.name,
					resolvedType,
					modeId,
					valueType: value === null ? "null" : typeof value,
				});
			}
		}
	}

	return { valueShapeMismatch, mismatchSamples };
}

function computeCountsSanity(counts, variables, collections) {
	const byCol = counts.variablesByCollectionId ?? {};
	const sumByCol = Object.values(byCol).reduce(
		(a, b) => a + Number(b || 0),
		0
	);
	const countMismatch =
		Number(counts.variables ?? Number.NaN) !== variables.length ||
		Number(counts.collections ?? Number.NaN) !== collections.length ||
		sumByCol !== variables.length;
	return { byCol, sumByCol, countMismatch };
}

function computeUnknownCollectionRefs(variables, collectionNameById) {
	let unknownCollectionRefs = 0;
	for (const v of variables) {
		if (
			v?.variableCollectionId &&
			!collectionNameById.has(v.variableCollectionId)
		)
			unknownCollectionRefs++;
	}
	return unknownCollectionRefs;
}

function computeModeNameFlags(collections) {
	const modeNameFlags = [];
	for (const c of collections) {
		for (const m of c?.modes ?? []) {
			if (m?.name === "Mode 1")
				modeNameFlags.push(`${c.name} -> ${m.name}`);
		}
	}
	return modeNameFlags;
}

function computeDerivedByCollectionId(variables) {
	const derivedByCol = {};
	for (const v of variables) {
		const id = v?.variableCollectionId ?? "UNKNOWN";
		derivedByCol[id] = (derivedByCol[id] ?? 0) + 1;
	}
	return derivedByCol;
}

function buildInventoryRows(byFileName) {
	const rows = [];

	for (const [fileName, items] of byFileName.entries()) {
		const newest = items[0];
		const json = newest?.json;
		if (!json) continue;

		const relPath = path.relative(repoRoot, newest.fp);
		const collections = getCollections(json);
		const variables = getVariables(json);
		const variableIdSet = new Set(
			variables.map((v) => v?.id).filter(Boolean)
		);
		const { hiddenTotal } = computeHiddenFromPublishing(variables);
		const { aliasMissingLocalTarget } = computeAliasMissingLocalTargets(
			variables,
			variableIdSet
		);

		rows.push({
			fileName,
			exportedAt: json?.meta?.exportedAt ?? "",
			fileKey: json?.meta?.fileKey ?? "",
			snapshotPath: relPath,
			collections: collections.length,
			variables: variables.length,
			hiddenFromPublishing: hiddenTotal,
			aliasMissingLocalTargets: aliasMissingLocalTarget,
			issueCount: Array.isArray(json?.issues) ? json.issues.length : 0,
		});
	}

	rows.sort((a, b) => String(a.fileName).localeCompare(String(b.fileName)));
	return rows;
}

function writeInventory(byFileName) {
	const inventoryRows = buildInventoryRows(byFileName);
	ensureDir(inventoryOutDir);

	const outJson = path.join(inventoryOutDir, "latest-inventory.json");
	const outCsv = path.join(inventoryOutDir, "latest-inventory.csv");
	fs.writeFileSync(
		outJson,
		JSON.stringify(
			{ generatedAt: new Date().toISOString(), rows: inventoryRows },
			null,
			2
		)
	);
	fs.writeFileSync(outCsv, toCsv(inventoryRows));

	console.log(`\nWrote inventory:`);
	console.log(`  - ${path.relative(repoRoot, outJson)}`);
	console.log(`  - ${path.relative(repoRoot, outCsv)}`);
}

function buildFindingsRows(byFileName) {
	const rows = [];

	for (const [fileName, items] of byFileName.entries()) {
		const newest = items[0];
		const json = newest?.json;
		if (!json) continue;

		const collections = getCollections(json);
		const variables = getVariables(json);
		const variableIdSet = new Set(
			variables.map((v) => v?.id).filter(Boolean)
		);

		const { hiddenByCollectionId, hiddenTotal } =
			computeHiddenFromPublishing(variables);
		const { aliasMissingLocalTarget, aliasMissingSamples } =
			computeAliasMissingLocalTargets(variables, variableIdSet);
		const mode1 = [];
		for (const c of collections) {
			for (const m of c?.modes ?? []) {
				if (m?.name === "Mode 1") {
					mode1.push({
						collectionId: c.id,
						collectionName: c.name,
						modeId: m.modeId,
						modeName: m.name,
					});
				}
			}
		}

		const hiddenBreakdown = Object.entries(hiddenByCollectionId)
			.map(([collectionId, count]) => {
				const collectionName =
					collections.find((c) => c.id === collectionId)?.name ??
					collectionId;
				return {
					collectionId,
					collectionName,
					hiddenCount: Number(count),
				};
			})
			.sort((a, b) => b.hiddenCount - a.hiddenCount);

		rows.push({
			fileName,
			exportedAt: json?.meta?.exportedAt ?? "",
			snapshotPath: path.relative(repoRoot, newest.fp),
			collections: collections.length,
			variables: variables.length,
			hiddenFromPublishingTotal: hiddenTotal,
			hiddenFromPublishingByCollection: hiddenBreakdown,
			mode1Modes: mode1,
			aliasMissingLocalTargets: aliasMissingLocalTarget,
			aliasMissingLocalSamples: aliasMissingSamples,
		});
	}

	rows.sort((a, b) => String(a.fileName).localeCompare(String(b.fileName)));
	return rows;
}

function writeFindings(byFileName) {
	ensureDir(inventoryOutDir);
	const rows = buildFindingsRows(byFileName);
	fs.writeFileSync(
		findingsOutPath,
		JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				newestPerFileName: true,
				rows,
			},
			null,
			2
		)
	);
	console.log(`\nWrote findings:`);
	console.log(`  - ${path.relative(repoRoot, findingsOutPath)}`);
}

function parseArgs(argv) {
	const args = new Set(argv);
	const latestOnly = args.has("--latest");
	const writeInventoryFlag = args.has("--inventory");
	const writeFindingsFlag = args.has("--findings");
	const help = args.has("--help") || args.has("-h");
	return { latestOnly, writeInventoryFlag, writeFindingsFlag, help };
}

function printHelp() {
	console.log(
		"Usage: node scripts/audit-figma-variables-snapshots.mjs [--latest] [--inventory]"
	);
	console.log(
		"  --latest   Only report the newest snapshot per meta.fileName"
	);
	console.log(
		"  --inventory  Write latest snapshot inventory to docs/devdocs/fig-bin/_inventory"
	);
	console.log(
		"  --findings  Write latest snapshot findings (mode names, hidden breakdown, alias samples) to docs/devdocs/fig-bin/_inventory"
	);
}

function parseSnapshots(filePaths) {
	const parsed = [];
	let bad = 0;
	for (const fp of filePaths) {
		try {
			const json = readJson(fp);
			parsed.push({ fp, json });
		} catch (e) {
			bad++;
			parsed.push({ fp, json: null, error: e });
		}
	}
	return { parsed, bad };
}

function groupByFileName(parsed) {
	const byFileName = new Map();
	for (const item of parsed) {
		const name = item?.json?.meta?.fileName ?? "(unknown)";
		if (!byFileName.has(name)) byFileName.set(name, []);
		byFileName.get(name).push(item);
	}

	for (const [, items] of byFileName.entries()) {
		items.sort((a, b) => {
			const at = a?.json?.meta?.exportedAt ?? "";
			const bt = b?.json?.meta?.exportedAt ?? "";
			// ISO timestamps are lexicographically sortable.
			return String(bt).localeCompare(String(at));
		});
	}

	return byFileName;
}

function selectNewestPaths(byFileName) {
	const newestPaths = [];
	for (const [, items] of byFileName.entries()) {
		const newest = items[0];
		if (newest?.fp) newestPaths.push(newest.fp);
	}
	return newestPaths.sort();
}

function printDuplicates(byFileName) {
	const dupes = [];
	for (const [name, items] of byFileName.entries()) {
		if (items.length > 1) {
			dupes.push({
				name,
				count: items.length,
				exportedAt: items
					.map((i) => i?.json?.meta?.exportedAt)
					.filter(Boolean),
			});
		}
	}

	if (!dupes.length) return;
	console.log("\nDuplicate snapshots detected (same meta.fileName):");
	for (const d of dupes.sort((a, b) => b.count - a.count)) {
		console.log(
			`  - ${d.name}: ${d.count} snapshots (${d.exportedAt.join(", ")})`
		);
	}
	console.log("Tip: re-run with --latest to keep the report focused.");
}

function summarizeSnapshot(filePath, snap) {
	const rel = path.relative(repoRoot, filePath);
	const meta = snap?.meta ?? {};
	const counts = snap?.counts ?? {};

	const collections = getCollections(snap);
	const variables = getVariables(snap);

	const collectionNameById = new Map(collections.map((c) => [c.id, c.name]));
	const variableIdSet = new Set(variables.map((v) => v?.id).filter(Boolean));

	const { hiddenByCollectionId, hiddenTotal } =
		computeHiddenFromPublishing(variables);
	const { aliasMissingLocalTarget, aliasMissingSamples } =
		computeAliasMissingLocalTargets(variables, variableIdSet);
	const { valueShapeMismatch, mismatchSamples } =
		computeValueShapeMismatches(variables);
	const { byCol, sumByCol, countMismatch } = computeCountsSanity(
		counts,
		variables,
		collections
	);
	const unknownCollectionRefs = computeUnknownCollectionRefs(
		variables,
		collectionNameById
	);
	const modeNameFlags = computeModeNameFlags(collections);
	const derivedByCol = computeDerivedByCollectionId(variables);

	const headerLines = [
		`\n— ${rel}`,
		`  fileName:    ${meta.fileName ?? "(unknown)"}`,
		`  fileKey:     ${meta.fileKey ?? "(null)"}`,
		`  exportedAt:  ${meta.exportedAt ?? "(unknown)"}`,
		`  collections: ${collections.length}`,
		`  variables:   ${variables.length}`,
		`  hiddenFromPublishing: ${hiddenTotal}`,
	];

	const warningLines = [
		countMismatch &&
			`  WARN: counts mismatch (counts.variables=${counts.variables}, sumByCollection=${sumByCol})`,
		unknownCollectionRefs &&
			`  WARN: ${unknownCollectionRefs} variables reference unknown collection IDs`,
		modeNameFlags.length &&
			`  NOTE: ${modeNameFlags.length} mode(s) still named "Mode 1" (not wrong, just usually worth renaming)`,
		aliasMissingLocalTarget &&
			`  NOTE: ${aliasMissingLocalTarget} alias reference(s) point to variable IDs not present in this snapshot (often remote/library variables).`,
		valueShapeMismatch &&
			`  WARN: ${valueShapeMismatch} value(s) do not match resolvedType shape (can contribute to “conflicting property values” issues).`,
	].filter(Boolean);

	const collectionsHeader = ["  Collections:"];
	const colRows = collections
		.map((c) => {
			const derivedCount = derivedByCol[c.id] ?? 0;
			const declaredCount = byCol[c.id];
			const modes = (c?.modes ?? []).map((m) => m.name).join(", ");
			return {
				name: c.name,
				id: c.id,
				derivedCount,
				declaredCount,
				modes,
			};
		})
		.sort((a, b) => b.derivedCount - a.derivedCount);

	const collectionsLines = colRows.map((row) => {
		const declared =
			row.declaredCount === undefined
				? ""
				: ` (counts: ${row.declaredCount})`;
		return `    - ${padRight(row.name, 12)} ${padRight(
			row.derivedCount,
			4
		)} vars${declared} | modes: ${row.modes}`;
	});

	// Hidden breakdown
	const hiddenRows = Object.entries(hiddenByCollectionId)
		.map(([colId, n]) => ({
			colId,
			name: collectionNameById.get(colId) ?? colId,
			n: Number(n),
		}))
		.sort((a, b) => b.n - a.n);

	const hiddenLines = hiddenRows.length
		? [
				"  Hidden by collection:",
				...hiddenRows.map(
					(r) => `    - ${padRight(r.name, 12)} ${r.n}`
				),
		  ]
		: [];

	const aliasLines = aliasMissingSamples.length
		? [
				"  Alias missing-local samples:",
				...aliasMissingSamples.map(
					(s) => `    - ${s.name} [mode ${s.modeId}] -> ${s.targetId}`
				),
		  ]
		: [];

	const mismatchLines = mismatchSamples.length
		? [
				"  Value-shape mismatch samples:",
				...mismatchSamples.map(
					(s) =>
						`    - ${s.name} (type ${s.resolvedType}) [mode ${s.modeId}] value typeof=${s.valueType}`
				),
		  ]
		: [];

	return [
		...headerLines,
		...warningLines,
		...collectionsHeader,
		...collectionsLines,
		...hiddenLines,
		...aliasLines,
		...mismatchLines,
	].join("\n");
}

function main() {
	const { latestOnly, writeInventoryFlag, writeFindingsFlag, help } =
		parseArgs(process.argv.slice(2));
	if (help) return printHelp();

	if (!isDir(figBinRoot)) {
		console.error(`Could not find: ${path.relative(repoRoot, figBinRoot)}`);
		process.exit(1);
	}

	const allSnapshots = listJsonSnapshots(figBinRoot).sort();
	if (!allSnapshots.length) {
		console.log(
			"No snapshots found. Expected something like docs/devdocs/fig-bin/<file>/variables-snapshot*.json"
		);
		return;
	}
	const { parsed, bad } = parseSnapshots(allSnapshots);
	const byFileName = groupByFileName(parsed);
	const snapshots = latestOnly ? selectNewestPaths(byFileName) : allSnapshots;

	console.log(
		`Found ${parsed.length} snapshot(s) across ${byFileName.size} fileName(s).` +
			(latestOnly
				? ` Reporting newest per fileName (${snapshots.length}).`
				: "")
	);

	if (writeInventoryFlag) writeInventory(byFileName);
	if (writeFindingsFlag) writeFindings(byFileName);

	for (const fp of snapshots) {
		const item = parsed.find((p) => p.fp === fp);
		if (!item || !item.json) {
			console.log(`\n— ${path.relative(repoRoot, fp)}`);
			console.log(
				`  ERROR: ${item?.error?.message ?? "Failed to read JSON"}`
			);
			continue;
		}
		const json = item.json;
		if (json?.schemaVersion !== "soloist-os.variables.snapshot.v1") {
			console.log(`\n— ${path.relative(repoRoot, fp)}`);
			console.log(
				`  WARN: unexpected schemaVersion: ${json?.schemaVersion}`
			);
		}
		console.log(summarizeSnapshot(fp, json));
	}

	// End summary: duplicates
	printDuplicates(byFileName);

	if (bad) {
		process.exitCode = 2;
	}
}

main();
