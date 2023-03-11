import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

export default function FunFacts() {
  const [randomKey, setRandomKey] = useState(1);
  const [funFactOpen, setFunFactOpen] = useState(true);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
  }


  useEffect(() => {
    const maxFactKey = 11;
    const interval = setInterval(() => {
      setRandomKey(Math.floor(Math.random() * maxFactKey + 1));
    }, 60000);
  }, []);

  const handleFunFacts = () => {
    setFunFactOpen(!funFactOpen);
  };

  return (
    <>
      {randomKey >= 0 && (
        <div class="facts-container">
          <div class="facts">
            💡 <FormattedMessage id={`fact${randomKey}`} />
          </div>
          <div class="popup-container">
            <div class={`popup ${isFixed ? 'fixed' : ''}`}>
              {funFactOpen ? <div class="popup-content">
                <FormattedMessage id={`fact${randomKey}`} />
              </div> : () => { }}
              <span class="funfact-toggler" onClick={handleFunFacts}>💡</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
