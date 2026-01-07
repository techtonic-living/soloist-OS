import { useRef, useEffect, useState } from "react";
import { colord } from "colord";
import { ATMOSPHERE_IMAGE } from "../../assets/atmosphere";

interface ImageCanvasPickerProps {
	onSelectColor: (hex: string) => void;
	imageUrl: string;
	// Physics props for Kaleidoscope mode
	speedVal?: number;
	senseVal?: number;
	// Transform props for Image mode
	zoomVal?: number;
	rotateVal?: number;
	onHoverColor?: (hex: string | null) => void;
	brightness?: number;
	vibrance?: number;
	isInverted?: boolean;
}

export const ImageCanvasPicker = ({
	onSelectColor,
	imageUrl,
	speedVal = 50,
	senseVal = 50,
	zoomVal = 50,
	rotateVal = 0,
	onHoverColor,
	brightness = 1,
	vibrance = 1,
	isInverted = false,
}: ImageCanvasPickerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [hoverColor, setHoverColor] = useState<string | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const mouseRef = useRef({ x: 0, y: 0 });

	// Kaleidoscope Configuration
	const SEGMENTS = 12;

	const sourceImageRef = useRef<HTMLImageElement | null>(null);
	const accumulatedTimeRef = useRef(0);
	const lastTimeRef = useRef(Date.now());

	// Effect 1: Handle Image Loading & Clean Canvas (on URL change)
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Clear canvas immediately when the URL changes to prevent leaks
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setImageLoaded(false);
		sourceImageRef.current = null;

		const img = new Image();
		if (imageUrl === "generated:crayons") {
			img.src = ATMOSPHERE_IMAGE;
		} else {
			img.crossOrigin = "Anonymous";
			img.src = imageUrl;
		}

		img.onload = () => {
			sourceImageRef.current = img;
			if (imageUrl === "generated:crayons") {
				const size = Math.min(img.width, 800);
				canvas.width = size;
				canvas.height = size;
			} else {
				const canvasSize = 320;
				canvas.width = canvasSize;
				canvas.height = canvasSize;
			}
			setImageLoaded(true);
		};
	}, [imageUrl]);

	// Effect 2: Rendering & Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imageLoaded || !sourceImageRef.current) return;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;

		let animationFrameId: number;
		const sourceImage = sourceImageRef.current;

		// Physics/Transform values correctly derived from current props
		const speedMult = 0.5 + speedVal / 50;
		const senseMult = 0.2 + senseVal / 100;
		const imagezoom = 0.5 + zoomVal / 66.67;
		const imageRotate = (rotateVal * Math.PI) / 180;

		const filterString = `brightness(${brightness}) saturate(${vibrance}) ${
			isInverted ? "invert(1)" : ""
		}`;

		const renderImage = () => {
			if (!sourceImage) return;
			const width = canvas.width;
			const height = canvas.height;
			const cx = width / 2;
			const cy = height / 2;

			ctx.clearRect(0, 0, width, height);
			ctx.save();
			ctx.filter = filterString;

			// Clip to circle
			ctx.beginPath();
			ctx.arc(cx, cy, width / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();

			// Apply transforms
			ctx.translate(cx, cy);
			ctx.rotate(imageRotate);
			ctx.scale(imagezoom, imagezoom);
			ctx.translate(-cx, -cy);

			// Draw image centered
			const scale = Math.max(
				width / sourceImage.width,
				height / sourceImage.height
			);
			const iw = sourceImage.width * scale;
			const ih = sourceImage.height * scale;
			ctx.drawImage(sourceImage, cx - iw / 2, cy - ih / 2, iw, ih);

			ctx.restore();
		};

		const render = () => {
			if (imageUrl === "generated:crayons" && sourceImage) {
				const now = Date.now();
				const deltaTime = (now - lastTimeRef.current) * 0.0002;
				lastTimeRef.current = now;

				// Incrementally track time to prevent jumps when speed changes
				accumulatedTimeRef.current += deltaTime * speedMult;

				const width = canvas.width;
				const height = canvas.height;
				const cx = width / 2;
				const cy = height / 2;
				const radius = Math.hypot(cx, cy);

				const mx = isHovering ? mouseRef.current.x / width : 0.5;
				const my = isHovering ? mouseRef.current.y / height : 0.5;

				// Sensitivity is now centered. Adjusting slider when not hovering (0.5) won't rotate.
				const angleOffset = (mx - 0.5) * Math.PI * 2 * senseMult;
				const zoom = 1.0 + my * 1.5;

				const sourceX =
					(Math.cos(accumulatedTimeRef.current) * 0.2 + 0.5) *
					sourceImage.width;
				const sourceY =
					(Math.sin(accumulatedTimeRef.current) * 0.2 + 0.5) *
					sourceImage.height;

				ctx.fillStyle = "#000";
				ctx.fillRect(0, 0, width, height);

				ctx.save();
				ctx.filter = filterString;

				const sliceAngle = (Math.PI * 2) / SEGMENTS;

				ctx.save();
				ctx.translate(cx, cy);
				ctx.rotate(angleOffset);

				for (let i = 0; i < SEGMENTS; i++) {
					ctx.save();
					ctx.rotate(i * sliceAngle);
					if (i % 2 === 1) ctx.scale(-1, 1);

					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.arc(
						0,
						0,
						radius,
						-sliceAngle / 2 - 0.01,
						sliceAngle / 2 + 0.01
					);
					ctx.closePath();
					ctx.clip();

					ctx.rotate(-Math.PI / 2);
					ctx.translate(-sourceX, -sourceY);
					ctx.scale(zoom, zoom);
					ctx.drawImage(sourceImage, 0, 0);
					ctx.restore();
				}
				ctx.restore();

				// Vignette
				const grad = ctx.createRadialGradient(
					cx,
					cy,
					width * 0.45,
					cx,
					cy,
					width * 0.7
				);
				grad.addColorStop(0, "transparent");
				grad.addColorStop(1, "rgba(0,0,0,0.6)");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, width, height);

				animationFrameId = requestAnimationFrame(render);
			}
		};

		// Start the appropriate render path
		if (imageUrl === "generated:crayons") {
			render();
		} else {
			renderImage();
		}

		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, [
		imageUrl,
		imageLoaded,
		isHovering,
		speedVal,
		senseVal,
		zoomVal,
		rotateVal,
	]);

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas || !imageLoaded) return;

		setIsHovering(true);
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (canvas.width / rect.width);
		const y = (e.clientY - rect.top) * (canvas.height / rect.height);
		mouseRef.current = { x, y };

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		try {
			const pixel = ctx.getImageData(x, y, 1, 1).data;
			const isTransparent = pixel[3] < 20;
			const isDeepBlack = pixel[0] < 5 && pixel[1] < 5 && pixel[2] < 5;

			if (isTransparent || isDeepBlack) {
				setHoverColor(null);
				canvas.style.cursor = "crosshair";
			} else {
				const hex = colord({
					r: pixel[0],
					g: pixel[1],
					b: pixel[2],
				}).toHex();
				setHoverColor(hex);
				onHoverColor?.(hex);
				canvas.style.cursor = "none";
			}
		} catch {
			setHoverColor(null);
		}
	};

	const handleClick = () => {
		if (hoverColor) onSelectColor(hoverColor);
	};

	return (
		<div className="flex flex-col items-center justify-center w-full h-full relative animate-in fade-in zoom-in duration-300">
			{/* Canvas - No padding, maximizes 320px radius */}
			<div
				className="relative flex-none group shadow-2xl rounded-full overflow-hidden border border-white/10 bg-black aspect-square w-full h-full transition-transform duration-500 ease-out"
				style={{
					boxShadow: isHovering
						? "0 0 80px rgba(50, 150, 255, 0.15)"
						: "0 0 50px rgba(0,0,0,0.5)",
				}}
			>
				{/* Outer gradient ring decoration */}
				<div
					className="absolute inset-0 rounded-full border-[1.5px] border-transparent opacity-80 pointer-events-none z-10"
					style={{
						background:
							"linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) border-box",
						WebkitMask:
							"linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
						WebkitMaskComposite: "destination-out",
						maskComposite: "exclude",
					}}
				/>

				<canvas
					ref={canvasRef}
					onMouseMove={handleMouseMove}
					onMouseLeave={() => {
						setIsHovering(false);
						setHoverColor(null);
						onHoverColor?.(null);
					}}
					onClick={handleClick}
					className="w-full h-full object-contain cursor-crosshair transition-transform duration-200"
				/>

				{/* Custom Cursor */}
				{hoverColor && isHovering && (
					<div
						className="absolute pointer-events-none transition-transform duration-75 rounded-full z-50 bg-transparent flex items-center justify-center"
						style={{
							left:
								(mouseRef.current.x /
									canvasRef.current!.width) *
									100 +
								"%",
							top:
								(mouseRef.current.y /
									canvasRef.current!.height) *
									100 +
								"%",
							width: 40,
							height: 40,
							transform: "translate(-50%, -50%)",
							border: "2px solid rgba(255,255,255,0.8)",
							boxShadow:
								"0 0 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.2)",
						}}
					>
						<div
							className="w-2 h-2 rounded-full shadow-sm"
							style={{
								backgroundColor: hoverColor,
								border: "1px solid rgba(255,255,255,0.8)",
							}}
						/>
					</div>
				)}
			</div>
			{/* Control bar moved to ColorCreator for proper alignment */}
		</div>
	);
};
