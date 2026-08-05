import React from "react";
import classnames from "classnames";
import { useIntl } from "react-intl";

export const WATER_CATEGORY = "water";
export const COOLING_SHELTER_CATEGORY = "cooling";

export function CategoryFilter({ activeCategory, onSelect }) {
  const intl = useIntl();

  const toggle = (category) => {
    onSelect(activeCategory === category ? null : category);
  };

  return (
    <div className="category-filter">
      <button
        type="button"
        className={classnames("category-filter-chip", {
          ["category-filter-chip-active"]: activeCategory === WATER_CATEGORY,
        })}
        onClick={() => toggle(WATER_CATEGORY)}
      >
        <span className="category-filter-chip-icon-container">
          <img
            className="category-filter-chip-icon"
            src="/public/images/map-pin.svg"
            alt=""
          />
        </span>
        <span className="category-filter-chip-label">
          {intl.formatMessage({ id: "categoryFilter.water" })}
        </span>
      </button>
      <button
        type="button"
        className={classnames("category-filter-chip", {
          ["category-filter-chip-active"]:
            activeCategory === COOLING_SHELTER_CATEGORY,
        })}
        onClick={() => toggle(COOLING_SHELTER_CATEGORY)}
      >
        <span className="category-filter-chip-icon-container">
          <img
            className="category-filter-chip-icon"
            src="/public/images/map-shelter-filter.svg"
            alt=""
          />
        </span>
        <span className="category-filter-chip-label">
          {intl.formatMessage({ id: "categoryFilter.coolingShelter" })}
        </span>
      </button>
    </div>
  );
}
