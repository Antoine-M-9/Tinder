import { useCookies } from "react-cookie";
import AuthModal from "../components/AuthModal";
import Nav from "../components/Nav";
import { useState } from "react";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const authToken = cookies.authToken


  const handleClick = () => {
    if (authToken) {
      removeCookie('UserId', cookies.UserId)
      removeCookie('AuthToken', cookies.authToken)
      window.location.reload()
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
        {showModal && <AuthModal setShowModal={setShowModal} isSignUp={isSignUp} />}
      </div>
    </div>
  );
};

export default Home;
