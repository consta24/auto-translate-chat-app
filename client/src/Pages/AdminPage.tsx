import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../Context/Context";
import { UserInterface } from "../Interfaces/UserInterface";

export default function AdminPage() {
  const userCtx = useContext(userContext);

  const [users, setUsers] = useState<UserInterface[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    const getUsers = () => {
      axios
        .get("http://localhost:4000/getusers", {
          withCredentials: true,
        })
        .then((res: AxiosResponse) => {
          if (res.status !== HttpStatusCode.Ok) {
            console.log(res.data);
          } else {
            setUsers(
              res.data.filter((user: UserInterface) => {
                return user.username !== userCtx.user!.username;
              })
            );
          }
        });
    };

    getUsers();

    const interval = setInterval(() => {
      getUsers();
    }, 2000);

    return () => clearInterval(interval);
  }, [userCtx]);

  const deleteUser = () => {
    axios
      .post(
        "http://localhost:4000/deleteuser",
        {
          username: selectedUser,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res.data);
        setUsers(
          users.filter(
            (user: UserInterface) =>
              user.username !== selectedUser &&
              user.username !== userCtx.user!.username
          )
        );
      });
  };

  return (
    <div>
      <h1>AdminPage</h1>
      <select
        onChange={(e) => setSelectedUser(e.target.value)}
        name="deleteuser"
        id="deleteuser"
      >
        <option id="Select a user">Select a user</option>
        {users.map((user: UserInterface) => {
          return <option id={user.username}>{user.username}</option>;
        })}
      </select>
      <button onClick={deleteUser}>Delete</button>
    </div>
  );
}
