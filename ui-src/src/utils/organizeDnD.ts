import type React from "react";
import { colord } from "colord";

type DragPreviewOptions =
	| {
			kind: "palette";
			title: string;
			colors: string[];
	  }
	| {
			kind: "color";
			title: string;
			color: string;
	  };

function buildOrganizePreviewElement(
	options: DragPreviewOptions,
	width: number,
	height: number
): HTMLDivElement {
	const preview = document.createElement("div");
	preview.style.width = `${width}px`;
	preview.style.height = `${height}px`;
	preview.style.position = "fixed";
	preview.style.left = "-10000px";
	preview.style.top = "-10000px";
	preview.style.zIndex = "2147483647";
	preview.style.pointerEvents = "none";
	preview.style.overflow = "hidden";
	// Match our mini-card styling: rounded-lg, border, subtle shadow
	preview.style.borderRadius = "8px";
	preview.style.boxShadow = "0 10px 24px rgba(0,0,0,0.45)";
	preview.style.transform = "translateZ(0)";

	// Background layer
	const bg = document.createElement("div");
	bg.style.position = "absolute";
	bg.style.inset = "0";

	// Content overlay layer
	const overlay = document.createElement("div");
	overlay.style.position = "absolute";
	overlay.style.inset = "0";
	overlay.style.padding = "8px";
	overlay.style.display = "flex";
	overlay.style.alignItems = "center";
	overlay.style.pointerEvents = "none";

	if (options.kind === "palette") {
		const colors = (options.colors || []).slice(0, 12);
		const first = colors[0] || "#000";
		const isFirstDark = colord(first).isDark();

		preview.style.border = isFirstDark
			? "1px solid rgba(255,255,255,0.4)"
			: "1px solid rgba(0,0,0,0.2)";
		preview.style.background = "rgba(10, 14, 20, 0.25)";

		// Bars
		bg.style.display = "flex";
		for (let i = 0; i < colors.length; i++) {
			const c = colors[i];
			const cell = document.createElement("div");
			cell.style.flex = "1 1 0%";
			cell.style.position = "relative";
			cell.style.overflow = "hidden";

			const rectEl = document.createElement("div");
			rectEl.style.position = "absolute";
			rectEl.style.inset = "0";
			rectEl.style.background = c;
			cell.appendChild(rectEl);

			if (i < colors.length - 1) {
				const divider = document.createElement("div");
				divider.style.position = "absolute";
				divider.style.right = "0";
				divider.style.top = "0";
				divider.style.bottom = "0";
				divider.style.width = "1px";
				divider.style.background = "rgba(255,255,255,0.2)";
				divider.style.zIndex = "1";
				cell.appendChild(divider);
			}

			// Hex label (bottom-left)
			const hex = document.createElement("div");
			hex.textContent = String(c).toUpperCase();
			hex.style.position = "absolute";
			hex.style.left = "6px";
			hex.style.bottom = "4px";
			hex.style.fontFamily =
				'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
			hex.style.fontSize = "8px";
			hex.style.opacity = "0.8";
			hex.style.whiteSpace = "nowrap";
			hex.style.color = colord(c).isDark()
				? "rgba(255,255,255,0.8)"
				: "rgba(0,0,0,0.7)";
			hex.style.textShadow = "0 1px 2px rgba(0,0,0,0.35)";
			cell.appendChild(hex);

			bg.appendChild(cell);
		}

		// Name (center)
		const name = document.createElement("div");
		name.textContent = options.title;
		name.style.position = "absolute";
		name.style.left = "8px";
		name.style.right = "8px";
		name.style.top = "50%";
		name.style.transform = "translateY(-50%)";
		name.style.fontSize = "9px";
		name.style.fontWeight = "700";
		name.style.letterSpacing = "0.08em";
		name.style.textTransform = "uppercase";
		name.style.whiteSpace = "nowrap";
		name.style.overflow = "hidden";
		name.style.textOverflow = "ellipsis";
		name.style.color = isFirstDark
			? "rgba(255,255,255,0.9)"
			: "rgba(0,0,0,0.8)";
		name.style.textShadow = "0 2px 6px rgba(0,0,0,0.35)";

		overlay.appendChild(name);
	} else {
		const c = options.color || "#000";
		const isDark = colord(c).isDark();

		preview.style.border = isDark
			? "1px solid rgba(255,255,255,0.4)"
			: "1px solid rgba(0,0,0,0.2)";

		bg.style.background = c;

		const name = document.createElement("div");
		name.textContent = options.title;
		name.style.position = "absolute";
		name.style.left = "8px";
		name.style.right = "8px";
		name.style.top = "50%";
		name.style.transform = "translateY(-50%)";
		name.style.fontSize = "9px";
		name.style.fontWeight = "700";
		name.style.letterSpacing = "0.08em";
		name.style.textTransform = "uppercase";
		name.style.whiteSpace = "nowrap";
		name.style.overflow = "hidden";
		name.style.textOverflow = "ellipsis";
		name.style.color = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)";
		name.style.textShadow = "0 2px 6px rgba(0,0,0,0.35)";

		const hex = document.createElement("div");
		hex.textContent = String(c).toUpperCase();
		hex.style.position = "absolute";
		hex.style.left = "8px";
		hex.style.bottom = "6px";
		hex.style.fontFamily =
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
		hex.style.fontSize = "8px";
		hex.style.opacity = "0.8";
		hex.style.color = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";
		hex.style.textShadow = "0 1px 2px rgba(0,0,0,0.35)";

		overlay.appendChild(name);
		overlay.appendChild(hex);
	}

	preview.appendChild(bg);
	preview.appendChild(overlay);
	return preview;
}

/**
 * Creates a floating ghost element for pointer-based organize dragging.
 */
export function createOrganizeDragGhost(
	options: DragPreviewOptions,
	width: number,
	height: number
): HTMLDivElement {
	const el = buildOrganizePreviewElement(options, width, height);
	el.style.opacity = "0.96";
	el.style.willChange = "left, top";
	el.style.left = "0px";
	el.style.top = "0px";
	return el;
}

export function positionOrganizeDragGhost(
	el: HTMLElement,
	clientX: number,
	clientY: number,
	offsetX: number,
	offsetY: number
) {
	el.style.left = `${Math.round(clientX - offsetX)}px`;
	el.style.top = `${Math.round(clientY - offsetY)}px`;
}

/**
 * Sets a consistent, artifact-free drag preview for organize-mode drags.
 * Avoids browser snapshots that can capture adjacent cards due to blur/overlap.
 */
export function setOrganizeDragPreview(
	e: React.DragEvent,
	options: DragPreviewOptions
) {
	try {
		const rect = (
			e.currentTarget as HTMLElement | null
		)?.getBoundingClientRect?.();
		const width = Math.max(120, Math.ceil(rect?.width ?? 220));
		// Mini cards in both tools are typically h-14 (~56px)
		const height = Math.max(56, Math.ceil(rect?.height ?? 56));

		const preview = buildOrganizePreviewElement(options, width, height);
		document.body.appendChild(preview);

		// Use center anchor to keep the ghost stable.
		e.dataTransfer.setDragImage(
			preview,
			Math.floor(width / 2),
			Math.floor(height / 2)
		);

		// Clean up immediately after the drag image has been captured.
		window.setTimeout(() => preview.remove(), 0);
	} catch {
		// If anything goes wrong, fall back to the browser default drag preview.
	}
}

/**
 * Forces the cursor to a hand/grabbing cursor during HTML5 drag.
 * Some browsers show a default arrow during drag even if the element uses cursor-grab.
 */
export function setOrganizeDragCursorActive(active: boolean) {
	try {
		const body = document.body as HTMLElement & {
			dataset: Record<string, string>;
		};
		const html = document.documentElement as HTMLElement;
		const key = "organizePrevCursor";
		const className = "organize-dragging";

		if (active) {
			if (body.dataset[key] === undefined) {
				body.dataset[key] = body.style.cursor || "";
			}
			// CSS class applies cursor: grabbing !important to everything.
			html.classList.add(className);
			body.classList.add(className);
			// Inline fallback (some browsers still respect it during drag)
			html.style.cursor = "grabbing";
			body.style.cursor = "grabbing";
			return;
		}

		const prev = body.dataset[key];
		html.classList.remove(className);
		body.classList.remove(className);
		html.style.cursor = "";
		body.style.cursor = prev ?? "";
		delete body.dataset[key];
	} catch {
		// no-op
	}
}
