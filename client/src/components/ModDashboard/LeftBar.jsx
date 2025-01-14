import React, { useState, useContext } from "react";
import { ModContext } from "../../pages/ModDashboard";
import { useDispatch } from "react-redux";
import { logout } from "../../actions/auth";

const LeftBar = ({ userName }) => {
  const [isActive, setIsActive] = useState("");
  const { toogleMenu } = useContext(ModContext);
  const dispatch = useDispatch();

  const toggleActive = (e) => {
    const elements = document.querySelectorAll(".left-bar-menu-element");

    toogleMenu(e.dataset.key);
    elements.forEach((e) => {
      e.classList.remove("active");
    });
    e.classList.add("active");
  };

  const handleLogout = async () => {
    dispatch(logout());
    localStorage.clear();
    window.location = "/";
  };

  const handleHome = () => {
    window.location = "/";
  };
  return (
    <div className="left-bar-container">
      <div className="left-bar-header">
        <img
          src={process.env.PUBLIC_URL + "/imgs/icons/church.png"}
          alt={"logo"}
          onClick={() => handleHome()}
        />
        <div>
          <h4>{userName}</h4>
          <h6>Administrateur</h6>
        </div>
      </div>

      <div className="left-bar-menu-container">
        <div
          className="left-bar-menu-element active"
          onClick={(e) => toggleActive(e.target)}
          data-key="1"
        >
          Actualités
        </div>
        <div
          className="left-bar-menu-element"
          onClick={(e) => toggleActive(e.target)}
          data-key="2"
        >
          Ma Paroisse
        </div>
        <div
          className="left-bar-menu-element"
          onClick={(e) => toggleActive(e.target)}
          data-key="3"
        >
          Demandes de messe
        </div>
      </div>

      <div className="left-bar-footer" onClick={() => handleLogout()}>
        <img
          src={process.env.PUBLIC_URL + "/imgs/icons/logout.png"}
          alt={"logo"}
        />

        <p>Se Déconnecter</p>
      </div>
    </div>
  );
};

export default LeftBar;
