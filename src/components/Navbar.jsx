import React from "react";
import { Link } from "react-router-dom";
import bannerImage from "../assets/banner.png";

function Navbar() {
  return (
    <nav>
      <div className="banner">
        <img src={bannerImage} alt="Top Planter Banner" />
      </div>
      <ul className="navbar-list">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/leaderboard">Leaderboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/social">Social</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
