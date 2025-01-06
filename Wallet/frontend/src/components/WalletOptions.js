import React from "react";
import { Button } from "antd";
import logo from "../assets/NarutoIcon.jpeg";

import secureLocalStorage from "react-secure-storage";
import { setChromeStorage } from "../helpers/chromeStorage";
import { performEncryption } from "../helpers/cryptoHelper";

function WalletOptions({
  setWalletTypeChanged
}) {
  const handleWalletOptions = (walletType, login = false) => {
    secureLocalStorage.setItem('walletType', walletType);
    secureLocalStorage.setItem('new-user', login)
    setChromeStorage('walletType', performEncryption(walletType))
    setWalletTypeChanged(walletType);
  }

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
          onClick={() => handleWalletOptions('decenterlized')}
          className="frontPageButton"
          type="primary"
        >
          Wallet (currenct device only)
        </Button>
        <Button
          onClick={() => handleWalletOptions('centerlized-login')}
          className="frontPageButton"
          type="default"
        >
          Email Login
        </Button>
      </div>
    </>
  );
}

export default WalletOptions;
