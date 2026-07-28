// Helpers for consuming the `GET .../clusters/all` category-segmented
// cluster-tree payload (see Api\TapClusterController@all / PR #129).

// Above this zoom we switch to real, individually-fetched taps (which
// support click-through to the tap detail modal) instead of cluster nodes.
export const MIN_ZOOM_FOR_INDIVIDUAL_TAPS = 15;

// Highest zoom at which each tree level (1 = finest, 5 = coarsest) should
// still be used. The last entry covers everything up to
// MIN_ZOOM_FOR_INDIVIDUAL_TAPS.
const LEVEL_ZOOM_BREAKPOINTS = [
  { level: 5, maxZoom: 5 },
  { level: 4, maxZoom: 8 },
  { level: 3, maxZoom: 11 },
  { level: 2, maxZoom: 13 },
  { level: 1, maxZoom: Infinity },
];

export function getClusterLevelForZoom(zoom) {
  const match = LEVEL_ZOOM_BREAKPOINTS.find((entry) => zoom <= entry.maxZoom);
  return (match || LEVEL_ZOOM_BREAKPOINTS[LEVEL_ZOOM_BREAKPOINTS.length - 1])
    .level;
}

export function shouldShowClusters(zoom) {
  return zoom < MIN_ZOOM_FOR_INDIVIDUAL_TAPS;
}

export function getZoomToRevealNextLevel(level, currentZoom) {
  const entry = LEVEL_ZOOM_BREAKPOINTS.find((e) => e.level === level);
  const currentLevelCeiling = entry ? entry.maxZoom : currentZoom;
  const next = Math.min(currentLevelCeiling + 1, MIN_ZOOM_FOR_INDIVIDUAL_TAPS);
  return Math.max(next, currentZoom + 1);
}

const CATEGORY_KEY_ALIASES = {
  cooling: ["cooling", "cooling_shelter", "coolingShelter", "shelter", "shelters"],
  water: ["water", "water_station", "waterStation"],
  all: ["all"],
};

// bounds: { nw: {lat,lng}, se: {lat,lng} } (google-map-react's onChange shape)
// bbox: { min_lat, max_lat, min_lng, max_lng } (a cluster node's bbox)
export function bboxIntersectsBounds(bbox, bounds) {
  if (!bounds || !bounds.nw || !bounds.se || !bbox) {
    return true;
  }
  const { nw, se } = bounds;
  return (
    bbox.min_lat <= nw.lat &&
    bbox.max_lat >= se.lat &&
    bbox.min_lng <= se.lng &&
    bbox.max_lng >= nw.lng
  );
}

// Prefers `categories.<key>.levels`; falls back to the top-level `levels`
// only when `categories` is absent entirely (older, pre-segmentation
// payloads, where top-level `levels` mirrors `categories.all`).
export function getLevelsForCategory(clusterTree, categoryKey) {
  if (!clusterTree) {
    return {};
  }
  if (clusterTree.categories) {
    const aliases = CATEGORY_KEY_ALIASES[categoryKey] || [categoryKey];
    for (const alias of aliases) {
      const levels = (clusterTree.categories[alias] || {}).levels;
      if (levels && Object.keys(levels).length) {
        return levels;
      }
    }
    return {};
  }
  return clusterTree.levels || {};
}

// categoryKey: "all" | "water" | "cooling"
export function getClusterNodes(clusterTree, categoryKey, zoom, bounds) {
  const levels = getLevelsForCategory(clusterTree, categoryKey);
  const level = getClusterLevelForZoom(zoom);
  const nodes = levels[String(level)] || [];
  return nodes
    .filter((node) => bboxIntersectsBounds(node.bbox, bounds))
    .map((node) => ({ ...node, level }));
}
