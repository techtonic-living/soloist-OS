export const RAIL_WIDTH_EXPANDED = "clamp(240px, 18vw, 360px)";
export const RAIL_WIDTH_COLLAPSED = "clamp(72px, 7vw, 108px)";

export const getRailWidth = (isExpanded: boolean) =>
	isExpanded ? RAIL_WIDTH_EXPANDED : RAIL_WIDTH_COLLAPSED;
