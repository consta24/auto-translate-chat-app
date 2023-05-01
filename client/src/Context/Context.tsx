import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { UserInterface } from "../Interfaces/UserInterface";

export const userContext = createContext<{
  user: UserInterface | undefined;
  updateUserContext: () => void;
}>({
  user: undefined,
  updateUserContext: () => {},
});

export const socketContext = createContext<Socket | null>(null);

export default function Context(props: PropsWithChildren<any>) {
  const [user, setUser] = useState<UserInterface>();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user && !socket) {
      setSocket(io("http://localhost:4000"));
    }
  }, [user, socket]);

  const updateUserContext = () => {
    axios
      .get("http://localhost:4000/user", { withCredentials: true })
      .then((res: AxiosResponse) => {
        if (res.status === HttpStatusCode.BadRequest) {
          console.log("Error trying to get user: " + res.data);
        }
        setUser(res.data);
      });
  };

  useEffect(() => {
    updateUserContext();
  }, []);

  return (
    <userContext.Provider value={{ user, updateUserContext }}>
      <socketContext.Provider value={socket!}>
        {props.children}
      </socketContext.Provider>
    </userContext.Provider>
  );
}
