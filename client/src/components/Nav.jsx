import React from "react";
import whiteLogo from "../images/tinder_logo_white.png";
import colorLogo from "../images/color-logo-tinder.png";

const Nav = ({ authToken, minimal, setShowModal, showModal, setIsSignUp }) => {
  
  const handleClick = () => {
    setShowModal(true);
    setIsSignUp(false)
  };

  return (
    <nav>
      <div className="logo-container">
        <img src={minimal ? colorLogo : whiteLogo} alt="" className="logo" />
      </div>

      {!authToken && !minimal && (
        <button className="nav-button" onClick={handleClick} disabled={showModal}>
          Log in
        </button>
      )}
    </nav>
  );
};

export default Nav;
