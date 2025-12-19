import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

const color = colord("#FF0000");
const hsl = color.toHsl();
const hsv = color.toHsv();

console.log("Color: #FF0000");
console.log("HSL:", hsl);
console.log("HSV:", hsv);
console.log(
	"HSL String:",
	`hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
);
console.log(
	"HSB String:",
	`hsb(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`
);
