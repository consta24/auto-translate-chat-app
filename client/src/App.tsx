import { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from "./Components/NavBar";

import { userContext } from "./Context/Context";

import AdminPage from "./Pages/AdminPage";
import Homepage from "./Pages/Homepage";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Register from "./Pages/Register";
import Contacts from "./Pages/Contacts";

import "./Style/main.css";

function App() {
  const userCtx = useContext(userContext);

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        {userCtx.user ? (
          <>
            {userCtx.user!.isAdmin ? (
              <Route path="/admin" element={<AdminPage />} />
            ) : null}
            <Route path="/profile" element={<Profile />} />
            <Route path="/contacts" element={<Contacts />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
