import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

export function FunFacts() {

    const funEmoji = ["💧", "🌊", "⏳", "🛍", "🥽", "🗑", "🏝", "🌏", "😯", "♳", "🐟"];

    return (
        <>
            <div className="facts">

                <FormattedMessage id={funFacts[currentIndex].fact} />
            </div>

        </>
    )
}