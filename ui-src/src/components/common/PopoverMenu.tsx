import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
	type RefObject,
} from "react";
import { createPortal } from "react-dom";

type Align = "start" | "center" | "end";

type PopoverMenuProps = {
	open: boolean;
	anchorRef: RefObject<HTMLElement | null>;
	onClose: () => void;
	children: ReactNode;
	className?: string;
	align?: Align;
	offset?: number;
	matchAnchorWidth?: boolean;
	viewportPadding?: number;
};

type Position = {
	top: number;
	left: number;
	anchorWidth: number;
};

const clamp = (v: number, min: number, max: number) =>
	Math.max(min, Math.min(max, v));

export const PopoverMenu = ({
	open,
	anchorRef,
	onClose,
	children,
	className,
	align = "end",
	offset = 8,
	matchAnchorWidth = false,
	viewportPadding = 8,
}: PopoverMenuProps) => {
	const menuRef = useRef<HTMLDivElement | null>(null);
	const [pos, setPos] = useState<Position>({
		top: 0,
		left: 0,
		anchorWidth: 0,
	});

	const updatePosition = () => {
		const anchor = anchorRef.current;
		if (!anchor) return;

		const rect = anchor.getBoundingClientRect();
		const menu = menuRef.current;

		// Use current menu width if available; fallback to a reasonable default.
		const menuWidth = menu?.offsetWidth ?? 240;
		const menuHeight = menu?.offsetHeight ?? 200;

		let left = rect.left;
		if (align === "end") left = rect.right - menuWidth;
		if (align === "center") left = rect.left + (rect.width - menuWidth) / 2;

		const desiredTop = rect.bottom + offset;
		let top = desiredTop;

		// If it would run off the bottom, flip above.
		const maxTop =
			globalThis.window.innerHeight - viewportPadding - menuHeight;
		if (top > maxTop) {
			top = rect.top - offset - menuHeight;
		}

		left = clamp(
			left,
			viewportPadding,
			globalThis.window.innerWidth - viewportPadding - menuWidth
		);
		top = clamp(
			top,
			viewportPadding,
			globalThis.window.innerHeight - viewportPadding - menuHeight
		);

		setPos({ top, left, anchorWidth: rect.width });
	};

	useLayoutEffect(() => {
		if (!open) return;
		updatePosition();
		// One more frame after mount to measure real menu size.
		const raf = globalThis.requestAnimationFrame(() => updatePosition());
		return () => globalThis.cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, align, offset, matchAnchorWidth, viewportPadding]);

	useEffect(() => {
		if (!open) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		const onPointerDown = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			const anchor = anchorRef.current;
			const menu = menuRef.current;

			if (menu && menu.contains(target)) return;
			if (anchor && anchor.contains(target)) return;
			onClose();
		};

		const onReflow = () => updatePosition();

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("touchstart", onPointerDown, {
			passive: true,
		});
		globalThis.window.addEventListener("resize", onReflow);
		// Capture scroll events from any ancestor scroller.
		globalThis.window.addEventListener("scroll", onReflow, true);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("touchstart", onPointerDown);
			globalThis.window.removeEventListener("resize", onReflow);
			globalThis.window.removeEventListener("scroll", onReflow, true);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div
			ref={menuRef}
			style={{
				position: "fixed",
				top: pos.top,
				left: pos.left,
				width: matchAnchorWidth ? pos.anchorWidth : undefined,
				zIndex: 10000,
			}}
			className={className}
			role="menu"
		>
			{children}
		</div>,
		document.body
	);
};
