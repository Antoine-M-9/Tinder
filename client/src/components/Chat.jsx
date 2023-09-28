import React from "react";

const Chat = ({ descendingOrderMessages }) => {
  return (
    <div className="chat-display">
      {descendingOrderMessages.map((message, index) => (
        <div key={index}>
          <div className="chat-message-header">
            <div className="img-container">
              <img src={message.img} alt={message.name + " profile"} />
            </div>
            <p style={{fontWeight: 'bold'}}>{message.name}</p>
          </div>
          <p>{message.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Chat;
