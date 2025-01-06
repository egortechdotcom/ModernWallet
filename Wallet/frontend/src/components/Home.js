import React from "react";
import { Button } from "antd";
import logo from "../assets/NarutoIcon.jpeg";

import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();
  return (
    <>
      <div className="content">
        <img
          src={logo}
          alt="logo"
          className="frontPageLogo"
        />
        <h4 className="h4">
          
        </h4>
        <Button
          onClick={() => navigate('yourwallet')}
          className="frontPageButton"
          type="primary"
        >
          Create A Wallet
        </Button>
        <Button
          onClick={() => navigate('recover')}
          className="frontPageButton"
          type="default"
        >
          Sign In With Seed Phrase
        </Button>
      </div>
    </>
  );
}

export default Home;
