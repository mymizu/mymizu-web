import React from "react";
import classnames from "classnames";
import { useIntl } from "react-intl";
import { keyboardClick, offMapProps } from "./Marker";

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
// A button for the same reason as Marker: clicking one zooms in.
export const ClusterMarker = (props) => {
  const { count, category, inView = true, onKeyboardClick } = props;
  const intl = useIntl();
  const size = clusterDiameter(count);

  return (
    <div className="cluster-marker-wrapper">
      <button
        type="button"
        className={classnames("cluster-marker", `cluster-marker-${category}`)}
        style={{ width: size, height: size }}
        aria-label={intl.formatMessage({ id: "marker.cluster" }, { count })}
        {...offMapProps(inView)}
        onClick={keyboardClick(onKeyboardClick, null, props)}
      >
        <span className="cluster-marker-count" aria-hidden="true">
          {formatCount(count)}
        </span>
      </button>
    </div>
  );
};
