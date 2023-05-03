import { useContext, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { socketContext, userContext } from "../Context/Context";
import { MessageInterface } from "../Interfaces/MessageInterface";

import axios, { AxiosResponse } from "axios";
import "../Style/ChatWindow.css";

type ChatWindowProps = {
  user: string;
};

export default function ChatWindow({ user }: ChatWindowProps) {
  const socketCtx = useContext(socketContext);
  const userCtx = useContext(userContext);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageInterface[]>([]);
  const [roomNumber, setRoomNumber] = useState<string>();

  const sendMessage = async () => {
    if (socketCtx === null) {
      console.log("Socket missing");
      return;
    }

    if (currentMessage && currentMessage !== "") {
      const messageData: MessageInterface = {
        room: roomNumber!,
        author: userCtx.user!.username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes() +
          ":" +
          new Date(Date.now()).getSeconds() +
          ":" +
          new Date(Date.now()).getMilliseconds(),
      };
      socketCtx.emit("join_room", roomNumber);
      socketCtx.emit("send_message", messageData);
      setMessageList((list: MessageInterface[]) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const roomNumber = [user, userCtx.user!.username].sort().join("-");

    console.log(userCtx);

    axios
      .get(`http://localhost:4000/messages/${roomNumber}`, {
        withCredentials: true,
      })
      .then((res: AxiosResponse) => {
        setMessageList(res.data.messages);
      })
      .catch((err) => {
        setMessageList([]);
      });

    if (socketCtx === null) {
      console.log("Socket missing");
      return;
    }

    socketCtx.emit("join_room", roomNumber);
    setRoomNumber(roomNumber);

    socketCtx.on("receive_message", (data) => {
      setMessageList((list: MessageInterface[]) => [...list, data]);
    });
    return () => {
      socketCtx.off("receive_message");
    };
  }, [socketCtx, user, userCtx]);

  return (
    <div className="chat-window fade-in">
      <div className="chat-header">
        <p>Chat with {user}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                key={messageContent.time}
                className="message"
                id={
                  userCtx.user!.username === messageContent.author
                    ? "you"
                    : "other"
                }
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">
                      {userCtx.user!.username === messageContent.author
                        ? "Me"
                        : messageContent.author}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Your message..."
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}
