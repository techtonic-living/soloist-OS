#!/usr/bin/env node
/*
  Soloist OS Preflight
  - Designed to be fast and non-destructive.
  - Fails (non-zero exit) when contract invariants are violated.
*/

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function log(msg = "") {
	process.stdout.write(`${msg}\n`);
}

function warn(msg) {
	process.stderr.write(`WARN: ${msg}\n`);
}

function fail(msg) {
	process.stderr.write(`FAIL: ${msg}\n`);
}

function sh(cmd, args) {
	try {
		return execFileSync(cmd, args, { encoding: "utf8" }).trim();
	} catch (e) {
		return null;
	}
}

function findLatestVariablesSnapshot(repoRoot) {
	const dir = path.join(repoRoot, "design", "contracts", "variables");
	if (!fs.existsSync(dir)) return null;

	const entries = fs
		.readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => {
			const fp = path.join(dir, f);
			const st = fs.statSync(fp);
			return { file: f, filePath: fp, mtimeMs: st.mtimeMs };
		})
		.sort((a, b) => b.mtimeMs - a.mtimeMs);

	if (entries.length === 0) return null;
	return entries[0];
}

function readJson(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");
	return JSON.parse(raw);
}

function coerceValuesByMode(valuesByMode) {
	// Snapshot shape historically uses an object keyed by modeId.
	// Return an array of mode values in a stable order.
	if (!valuesByMode || typeof valuesByMode !== "object") return [];
	return Object.entries(valuesByMode)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, v]) => v);
}

function isAliasValue(v) {
	// Typical export shape: { type: 'VARIABLE_ALIAS', id: '...' }
	return Boolean(v && typeof v === "object" && v.type === "VARIABLE_ALIAS");
}

function tryGetNumericValue(v) {
	// Some exports store numbers directly, others wrap.
	if (typeof v === "number") return v;
	if (v && typeof v === "object") {
		if (typeof v.value === "number") return v.value;
		if (typeof v.number === "number") return v.number;
	}
	return null;
}

function main() {
	const repoRoot = process.cwd();

	log("Soloist OS — Preflight");
	log("----------------------");

	const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
	const status = sh("git", ["status", "--porcelain"]);
	if (branch) log(`git branch: ${branch}`);
	if (status != null) {
		const dirty = status.length > 0;
		log(`git dirty: ${dirty ? "yes" : "no"}`);
		if (dirty)
			warn(
				"Working tree has uncommitted changes. That’s fine, but be intentional."
			);
	}

	const latest = findLatestVariablesSnapshot(repoRoot);
	if (!latest) {
		fail(
			"No variables snapshots found under design/contracts/variables/*.json"
		);
		process.exit(2);
	}

	log(`latest snapshot: design/contracts/variables/${latest.file}`);

	let snapshot;
	try {
		snapshot = readJson(latest.filePath);
	} catch (e) {
		fail(`Could not parse snapshot JSON: ${e?.message ?? String(e)}`);
		process.exit(2);
	}

	const variables = Array.isArray(snapshot?.variables)
		? snapshot.variables
		: [];
	if (variables.length === 0) {
		warn(
			"Snapshot contains no variables[]; invariant checks may be inconclusive."
		);
	}

	let ok = true;

	// Invariant 1: color/tool/* must be VARIABLE_ALIAS (no duplicated hex/tool values).
	const toolVars = variables.filter(
		(v) => typeof v?.name === "string" && v.name.startsWith("color/tool/")
	);
	if (toolVars.length === 0) {
		warn("No variables named color/tool/* found in snapshot.");
	} else {
		const offenders = [];
		for (const v of toolVars) {
			const modeValues = coerceValuesByMode(v.valuesByMode);
			if (modeValues.length === 0) {
				warn(`color/tool var has no valuesByMode: ${v.name}`);
				continue;
			}
			// All modes should be aliases.
			const nonAlias = modeValues.filter((mv) => !isAliasValue(mv));
			if (nonAlias.length > 0) offenders.push(v.name);
		}
		if (offenders.length > 0) {
			ok = false;
			fail(
				`Invariant violated: color/tool/* must be VARIABLE_ALIAS. Offenders (${offenders.length}):`
			);
			for (const n of offenders) fail(`  - ${n}`);
		} else {
			log("PASS: color/tool/* are VARIABLE_ALIAS");
		}
	}

	// Invariant 2: Stroke ladder is fixed.
	const strokeExpect = {
		"stroke/hairline": 0.5,
		"stroke/thin": 1,
		"stroke/medium": 1.5,
		"stroke/bold": 2,
	};

	const strokeVars = Object.keys(strokeExpect).map((name) => ({
		name,
		v: variables.find((v) => v?.name === name),
	}));

	const missingStroke = strokeVars
		.filter(({ v }) => !v)
		.map(({ name }) => name);
	if (missingStroke.length > 0) {
		warn(`Missing stroke vars in snapshot: ${missingStroke.join(", ")}`);
	}

	const badStroke = [];
	for (const { name, v } of strokeVars) {
		if (!v) continue;
		const modeValues = coerceValuesByMode(v.valuesByMode);
		const numeric = modeValues
			.map(tryGetNumericValue)
			.find((n) => typeof n === "number");
		if (numeric == null) {
			warn(`Could not parse numeric value for ${name}`);
			continue;
		}
		const expected = strokeExpect[name];
		if (numeric !== expected) {
			badStroke.push({ name, got: numeric, expected });
		}
	}

	if (badStroke.length > 0) {
		ok = false;
		fail("Invariant violated: stroke ladder values must be 0.5/1/1.5/2");
		for (const b of badStroke)
			fail(`  - ${b.name}: got ${b.got}, expected ${b.expected}`);
	} else {
		log("PASS: stroke ladder matches 0.5/1/1.5/2 (where present)");
	}

	if (!ok) {
		fail(
			"Preflight failed. Stop and fix invariants before making other changes."
		);
		process.exit(1);
	}

	log("OK: Preflight passed.");
}

main();
