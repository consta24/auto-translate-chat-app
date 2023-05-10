import axios, { HttpStatusCode } from "axios";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { userContext } from "../Context/Context";

import "../Style/NavBar.css";

type NavBarProps = {
  setShowProfile: (show: boolean) => void;
};

export default function NavBar({ setShowProfile }: NavBarProps) {
  const userCtx = useContext(userContext);

  const logout = () => {
    axios
      .get("http://localhost:4000/logout", { withCredentials: true })
      .then((res) => {
        if (res.status === HttpStatusCode.Ok) {
          window.location.href = "/";
        }
      });
  };

  return (
    <div className="NavContainer fade-in">
      <h1>Contacts</h1>
      <>
        {userCtx.user!.isAdmin ? (
          <>
            <Link to="/admin">Admin</Link>
          </>
        ) : null}
        <Link to={""} onClick={() => setShowProfile(true)}>
          Profile
        </Link>
        <Link to="" onClick={logout}>
          Logout
        </Link>
      </>
    </div>
  );
}
