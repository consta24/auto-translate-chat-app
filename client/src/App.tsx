import { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { userContext } from "./Context/Context";

import AdminPage from "./Pages/AdminPage";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Register from "./Pages/Register";
import Contacts from "./Pages/Contacts";

import "./Style/main.css";

function App() {
  const userCtx = useContext(userContext);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {userCtx.user ? (
            <>
              {userCtx.user!.isAdmin ? (
                <Route path="/admin" element={<AdminPage />} />
              ) : null}
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Contacts />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
