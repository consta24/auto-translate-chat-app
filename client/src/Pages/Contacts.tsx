import axios from "axios";
import { useContext, useState } from "react";
import { userContext } from "../Context/Context";
import ChatWindow from "./ChatWindow";

import "../Style/Contacts.css";

export default function Contacts() {
  const userCtx = useContext(userContext);

  const [contactToAdd, setContactToAdd] = useState<string>();
  const [selectedUser, setSelectedUser] = useState<string>();

  const addContact = () => {
    axios
      .post(
        "http://localhost:4000/addcontact",
        {
          username: userCtx.user!.username,
          contact: contactToAdd,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        userCtx.updateUserContext();
      });
  };

  return (
    <div className="contacts-chat-window fade-in">
      <div className="contacts-container">
        <h1>Contacts</h1>
        <input
          type="text"
          placeholder="Contact..."
          onChange={(e) => setContactToAdd(e.target.value)}
        />
        <button onClick={addContact} id="add-contact">
          Add
        </button>
        <div className="contacts-list">
          <ul>
            {userCtx.user!.contacts!.map((user) => {
              return (
                <li key={user}>
                  <button onClick={() => setSelectedUser(user)}>{user}</button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="chat-container">
        {selectedUser ? (
          <>
            <ChatWindow user={selectedUser} />
          </>
        ) : (
          <h1>Select a user to open a chat.</h1>
        )}
      </div>
    </div>
  );
}
