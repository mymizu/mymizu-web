import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

export default function FunFacts() {
  const [randomKey, setRandomKey] = useState(1);

  useEffect(() => {
    const maxFactKey = 11;
    const interval = setInterval(() => {
      setRandomKey(Math.floor(Math.random() * maxFactKey + 1));
    }, 60000);
  }, []);
  return (
    <>
      {randomKey >= 0 && (
        <div className="facts">
          <FormattedMessage id={`fact${randomKey}`} />
        </div>
      )}
    </>
  );
}
