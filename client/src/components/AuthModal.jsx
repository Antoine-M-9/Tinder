import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import React from "react";

const AuthModal = ({ setShowModal, isSignUp }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [error, setError] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const [attemptedToSetCookies, setAttemptedToSetCookies] = useState(false); // Nouvel état

  let navigate = useNavigate();

  const handleClick = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp && password !== confirmPassword) {
        setError("Passwords need to match!");
        return;
      }
      const response = await axios.post(
        `http://localhost:8000/${isSignUp ? "signup" : "login"}`,
        { email, password }
      );
      setCookie("AuthToken", response.data.token);
      setCookie("UserId", response.data.userId);

      setAttemptedToSetCookies(true);

      // Vérifiez que les cookies sont définis
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (attemptedToSetCookies) {
      // Vérifiez si vous avez essayé de définir les cookies
      if (cookies.AuthToken && cookies.UserId) {
        // Les cookies sont définis, naviguez vers la page appropriée
        if (isSignUp) navigate("/onboarding");
        else navigate("/dashboard");
        window.location.reload();
      } else {
        // Les cookies ne sont pas définis, affichez un message d'erreur
        setError("There was a problem setting the cookies");
      }
    }
  }, [cookies, attemptedToSetCookies]);

  return (
    <div className="auth-modal">
      <div className="close-icon" onClick={handleClick}>
        ⓧ
      </div>

      <h2>{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}</h2>
      <p>
        By clicking Log In, you agree to our terms. Learn how we process your
        data in our Privacy Policy and Cookie Policy.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="email"
          required={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="password"
          required={true}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignUp && (
          <input
            type="password"
            id="password-check"
            name="password-check"
            placeholder="confirm password"
            required={true}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <input className="secondary-button" type="submit" />
        <p>{error}</p>
      </form>

      <hr />
      <h2>GET THE APP</h2>
    </div>
  );
};
export default AuthModal;
