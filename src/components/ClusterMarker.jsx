import React from "react";
import classnames from "classnames";

// Rough size tiers so a cluster of 4000 taps visibly reads as "bigger" than
// one of 12, without needing continuous scaling.
const clusterDiameter = (count) => {
  if (count >= 1000) return 64;
  if (count >= 200) return 56;
  if (count >= 50) return 48;
  if (count >= 10) return 42;
  return 34;
};

const formatCount = (count) => {
  if (count >= 1000) {
    return `${Math.round(count / 100) / 10}k`;
  }
  return count;
};

// category: "all" | "water" | "cooling" — used only for the badge color.
export const ClusterMarker = ({ count, category }) => {
  const size = clusterDiameter(count);

  return (
    <div className="cluster-marker-wrapper">
      <div
        className={classnames("cluster-marker", `cluster-marker-${category}`)}
        style={{ width: size, height: size }}
      >
        <span className="cluster-marker-count">{formatCount(count)}</span>
      </div>
    </div>
  );
};
