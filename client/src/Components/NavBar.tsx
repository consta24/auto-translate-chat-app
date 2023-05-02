import axios, { HttpStatusCode } from "axios";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { userContext } from "../Context/Context";

import "../Style/NavBar.css";

export default function NavBar() {
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
      <Link to="/">Home</Link>
      {userCtx.user ? (
        <>
          {userCtx.user.isAdmin ? (
            <>
              <Link to="/admin">Admin</Link>
            </>
          ) : null}
          <Link to="/contacts">Contacts</Link>
          <Link to="/profile">Profile</Link>
          <Link onClick={logout} to="/logout">
            Logout
          </Link>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
}
