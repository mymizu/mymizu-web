import React from "react";

const lang = "en"; // TODO: remove when i18n is supported

// TODO: add ja translation
// TODO: check with product if there are other variations
const data = {
  emoji: "😅",
  en: "We’ve noticed that there are no refill spots close to you. Would you like to add a new refill spot?",
  ja: "",
};

const Message = ({ emoji = data.emoji, text = data[lang] }) => {
  return (
    <div className="message">
      {emoji && <span className="message__emoji">{emoji}</span>}
      <div className="message__text">{text}</div>
    </div>
  );
};
export default Message;
