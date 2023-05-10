import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  function handleCheckboxChange() {
    console.log(isChecked);
    setIsChecked(!isChecked);
  }

  const register = () => {
    axios
      .post(
        "http://localhost:4000/register",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res: AxiosResponse) => {
        window.location.href = "/login";
      });
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card2">
          <div className="form">
            <p id="heading">Sign Up</p>
            <div className="field">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className="input-icon"
              >
                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
              </svg>
              <input
                type="text"
                className="input-field"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className="input-icon"
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
              </svg>
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="checkbox-container">
              <label className="checkbox-label">
                <input
                  onChange={handleCheckboxChange}
                  checked={isChecked}
                  type="checkbox"
                />
                <div className="checkmark"></div>
              </label>
              <p>Accept&nbsp;</p>
              <Link to="">Terms and Conditions.</Link>
            </div>

            <div className="btn">
              <button onClick={register} className="button1">
                Sign Up
              </button>
            </div>
            <div className="account-present-already">
              <p>Already have an account?</p>
              <Link to="/login" className="register-login">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
