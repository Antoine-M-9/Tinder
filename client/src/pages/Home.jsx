import { useCookies } from "react-cookie";
import AuthModal from "../components/AuthModal";
import Nav from "../components/Nav";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const navigate = useNavigate();

  const authToken = cookies.AuthToken;

  const handleClick = () => {
    if (authToken) {
      removeCookie("UserId", cookies.UserId);
      removeCookie("AuthToken", cookies.authToken);
      window.location.reload();
    }

    setShowModal(true);
    setIsSignUp(true);
  };

  return (
    <div className="overlay">
      <Nav
        authToken={authToken}
        minimal={false}
        setShowModal={setShowModal}
        showModal={showModal}
        setIsSignUp={setIsSignUp}
      />
      <div className="home">
        <h1 className="primary-title">Swipe Right®️</h1>
        <button className="primary-button" onClick={handleClick}>
          {authToken ? "Signout" : "Create Accunt"}
        </button>
        {authToken && (
          <button
            style={{ marginLeft: "25px" }}
            className="primary-button"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        )}
        {showModal && (
          <AuthModal setShowModal={setShowModal} isSignUp={isSignUp} />
        )}
      </div>
    </div>
  );
};

export default Home;
