import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

export function FunFacts() {

    const [randomKey, setRandomKey] = useState();

    useEffect(() => {
        const maxFactKey = 11;
        setRandomKey(Math.floor(Math.random() * maxFactKey + 1));
    }, []);
    const funEmoji = ["💧", "🌊", "⏳", "🛍", "🥽", "🗑", "🏝", "🌏", "😯", "♳", "🐟"];

    function randomEmoji() {
        let randomIndex = Math.floor(Math.random() * funEmoji.length);
        return funEmoji[randomIndex];
    }

    return (
        <>
            <div className="facts">
                {randomEmoji()}
                <FormattedMessage id={`fact${randomKey}`} />
            </div>

        </>
    );
}
