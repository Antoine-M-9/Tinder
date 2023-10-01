import axios from "axios";
import React from "react";
import { useState } from "react";

const ChatInput = ({user, clickedUser, getUsersMessages, getClickedUsersMessages}) => {
  const [textArea, setTextArea] = useState("");
  const userId = user?.user_id
  const clickUserId = clickedUser?.user_id

  const addMessage = async () => {
    const message = {
      timestamp: new Date().toISOString(),
      from_userId: userId,
      to_userId: clickUserId,
      message: textArea
    }

    try {
      await axios.post('https://dreamy-dragon-d4017a.netlify.app/message', { message })
      getUsersMessages()
      getClickedUsersMessages()
      setTextArea("")
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="chat-input">
      <textarea
        value={textArea}
        onChange={(e) => setTextArea(e.target.value)}
      />
      <button className="secondary-button" onClick={addMessage}>Submit</button>
    </div>
  );
};

export default ChatInput;
