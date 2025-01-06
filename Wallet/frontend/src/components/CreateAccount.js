import { Button, Card } from "antd";
import React, { useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import  secureLocalStorage  from  "react-secure-storage";


function CreateAccount({ setWallet, setSeedPharse }) {
  const [newSeedPharse, setNewSeedPharse] = useState(null);
  const navigate = useNavigate();


  function generateWallet() {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    setNewSeedPharse(mnemonic);
  }

  function setWalletAndMnemonic() {
    setSeedPharse(newSeedPharse);
    setWallet(ethers.Wallet.fromPhrase(newSeedPharse).address);
    secureLocalStorage.setItem('seedParse',newSeedPharse);
    secureLocalStorage.setItem('wallet',ethers.Wallet.fromPhrase(newSeedPharse).address);
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
            Once you generate the seed phase, save it securley in order to recover
            your wallet in the future
          </div>
        </div>
        <Button
          className="frontPageButton"
          type="primary"
          onClick={() => generateWallet()}
        >
          Generate Seed Phrase
        </Button>
        <Card className="seedPhraseContainer">
          {newSeedPharse && <pre style={{ whiteSpace: "pre-wrap" }}>{newSeedPharse}</pre>}
        </Card>
        <Button
          className="frontPageButton"
          type="default"
          onClick={() => setWalletAndMnemonic()}
        >
          Open Your New Wallet
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

export default CreateAccount;
