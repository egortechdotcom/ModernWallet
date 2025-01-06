import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ethers } from "ethers";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setChromeStorage } from "../helpers/chromeStorage";
import { performEncryption } from "../helpers/cryptoHelper";

function RecoverAccount({ setWallet, setSeedPharse }) {
  const navigate = useNavigate();
  const [typedSeed, setTypeSeed] = useState("");
  const [nonValid, setNonInvalid] = useState(false);

  function seedAdjust(e) {
    setNonInvalid(false);
    setTypeSeed(e.target.value);
  }

  function recoverWallet() {
    let recoveredWallet;
    try {
      recoveredWallet = ethers.Wallet.fromPhrase(typedSeed);
    } catch (error) {
      setNonInvalid(true);
      return;
    }

    console.log(`Typed Seed: ${typedSeed}`);
    console.log(`Recovered Wallet: ${typedSeed}`);

    // secureLocalStorage.setItem('seedParse', typedSeed);
    // secureLocalStorage.setItem('wallet', recoveredWallet.address);
    setChromeStorage('DseedParse', performEncryption(typedSeed))
    setChromeStorage('Dwallet', performEncryption(recoveredWallet.address))
    setSeedPharse(typedSeed);
    setWallet(recoveredWallet.address);
    navigate('/yourwallet');
    return;
  }

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <ExclamationCircleOutlined style={
            ({
              fontSize: '20px'
            })
          } />
          <div style={({ fontSize: '14px' })}>
            Type your seed phrase inthe field below to recover your wallet
            (it should include 12 words seperated with space)
          </div>
        </div>
        <TextArea
          onChange={(seedAdjust)}
          rows={4}
          className="seedPhraseContainer"
          placeholder="Enter your seed pharse"
        ></TextArea>
        {nonValid && <p style={{ color: 'red' }}>Invalid seed pharse</p>}
        <Button
          disabled={
            typedSeed.split(" ").length !== 12 || typedSeed.slice(-1) === " "
          }
          className="frontPageButton"
          type="primary"
          onClick={() => recoverWallet()}
        >
          Recover Wallet
        </Button>
        <p
          className="frontPageBottom"
          onClick={() => navigate('/')}
        >
          Back Home
        </p>
      </div>
    </>
  );
}

export default RecoverAccount;
