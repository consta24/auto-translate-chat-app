import axios from "axios";
import { useContext, useState } from "react";
import { userContext } from "../Context/Context";
import ChatWindow from "./ChatWindow";

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
    <div>
      <h1>Contacts</h1>
      <input
        type="text"
        placeholder="Add contact..."
        onChange={(e) => setContactToAdd(e.target.value)}
      />
      <button onClick={addContact}>Add Contact</button>
      <div>
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
      {selectedUser ? (
        <>
          <ChatWindow user={selectedUser} />
        </>
      ) : (
        <h1>Select a user to open a chat.</h1>
      )}
    </div>
  );
}
