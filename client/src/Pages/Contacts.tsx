import axios from "axios";
import { SetStateAction, useContext, useState } from "react";
import { userContext } from "../Context/Context";
import ChatWindow from "./ChatWindow";

import "../Style/Contacts.css";
import NavBar from "../Components/NavBar";
import Profile from "./Profile";

export default function Contacts() {
  const userCtx = useContext(userContext);

  const [contactToAdd, setContactToAdd] = useState<string>();
  const [selectedUser, setSelectedUser] = useState<string>();
  const [showProfile, setShowProfile] = useState<boolean>(false);

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

  const showConversationsFromSelectedeUser = (
    user: SetStateAction<string | undefined>
  ) => {
    setShowProfile(false);
    setSelectedUser(user);
  };

  return (
    <div className="contacts-div">
      <div className="navbar-container">
        <NavBar setShowProfile={setShowProfile} />
      </div>
      <div className="contacts-chat-window fade-in">
        <div className="contacts-container">
          <div className="input-form">
            <input
              type="text"
              placeholder="Add contact..."
              onChange={(e) => setContactToAdd(e.target.value)}
            />
            <button onClick={addContact} id="add-contact">
              Add
            </button>
          </div>
          <div className="contacts-list">
            <ul>
              {userCtx.user!.contacts!.map((user) => {
                return (
                  <li key={user}>
                    <button
                      onClick={() => showConversationsFromSelectedeUser(user)}
                    >
                      {user}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="chat-container">
          {showProfile ? (
            <Profile />
          ) : selectedUser ? (
            <ChatWindow user={selectedUser} />
          ) : (
            <h1>Select a user to open a chat.</h1>
          )}
        </div>
      </div>
    </div>
  );
}
