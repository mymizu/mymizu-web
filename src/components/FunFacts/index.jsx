import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

export default function FunFacts() {
  const [randomKey, setRandomKey] = useState();

  useEffect(() => {
    const maxFactKey = 11;
    setRandomKey(Math.floor(Math.random() * maxFactKey + 1));
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
