import "./App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { CHAINS_CONFIG } from "./chains";


/** Wallet seperate  */
import Header from './components/header';
import WalletOptions from "./components/WalletOptions";
import AuthenticatedRoutes from "./components/AuthenticatedRoutes";
import SignUp from "./components/centerlized/signup";
import Login from "./components/centerlized/login";
import CenterlizedRoutes from "./Routes";
// import { useSettingsStore } from "./helpers/chromeStorage";
// import { chrome } from 'chrome';

/** Wallet seperate  */

/** Chrome extension */
import { getChromeStorage, setChromeStorage } from './helpers/chromeStorage';
import { performDecryption, performEncryption } from "./helpers/cryptoHelper";

/** Chrome extension end */
function App() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [seedParse, setSeedPharse] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x1");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [networkURL, setNetworkURL] = useState("");
  const [chainId, setChainId] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");

  const [walletTypeChanged, setWalletTypeChanged] = useState(false); // New state variable
  // const [storgaeChrome, setStorageCrome] = useSettingsStore();




  const handleAddNetwork = () => {
    const newNetwork = {
      hex: chainId,
      name: networkName,
      rpcUrl: networkURL,
      ticker: currencySymbol,
      txnURL: "https://sepolia.etherscan.io/tx/",
    };
    CHAINS_CONFIG[newNetwork.hex] = newNetwork;
    closeModal();
    setNetworkName("");
    setNetworkURL("");
    setChainId("");
    setCurrencySymbol("");

  };

  const initAppJs = async () => {
    const DseedParsePromise = new Promise((resolve) => {
      getChromeStorage('DseedParse', (value) => {
        let data = performDecryption(value);
        setSeedPharse(data);
        resolve(data);
      });
    });

    const DwalletPromise = new Promise((resolve) => {
      getChromeStorage('Dwallet', (value) => {
        let data = performDecryption(value);
        setWallet(data);
        resolve(data);
      });
    });

    const decenterlizedSelectedChainPromise = new Promise((resolve) => {
      getChromeStorage('decenterlizedSelectedChain', (value) => {
        let data = performDecryption(value);
        setSelectedChain(data);
        resolve(data);
      });
    });

    const walletTypePromise = new Promise((resolve) => {
      let key = 'walletType'
      getChromeStorage(key, (value) => {
        let data = performDecryption(value)
        secureLocalStorage.setItem('walletType', data)
        console.log(`wallet type  ${data}`);
        resolve()
      })
    });

    // setChromeStorage(performEncryption('walletType'), performEncryption(walletType))


    const [DseedParse, Dwallet, decenterlizedSelectedChain] = await Promise.all([DseedParsePromise, DwalletPromise, decenterlizedSelectedChainPromise]);
    await walletTypePromise;

    return { DseedParse, Dwallet, decenterlizedSelectedChain };
  }


  useEffect(() => {
    initAppJs().then(({ DseedParse, Dwallet, decenterlizedSelectedChain }) => {
      console.table([
        DseedParse, Dwallet, decenterlizedSelectedChain
      ])
      if (Dwallet && DseedParse && decenterlizedSelectedChain) {
        console.log(secureLocalStorage.getItem('walletType'));
        if (secureLocalStorage.getItem('walletType') && secureLocalStorage.getItem('walletType') === 'decenterlized') {
          console.log('YOUR WALLET');
          navigate("/yourwallet");
        } else {
          console.log('YOUR WALLET CENTER');
          navigate("/centerlized-wallet-view");
        }
      }
    });
  }, []);

  useEffect(() => {
    initAppJs().then(({ DseedParse, Dwallet, decenterlizedSelectedChain }) => {
      if (decenterlizedSelectedChain) {
        setSelectedChain(decenterlizedSelectedChain);
      }
      if (Dwallet && DseedParse && decenterlizedSelectedChain) {
        setWallet(Dwallet);
        setSeedPharse(DseedParse);
        if (secureLocalStorage.getItem('walletType') && secureLocalStorage.getItem('walletType') === 'decenterlized') {
          navigate("/yourwallet");
        } else {
          navigate("/centerlized-wallet-view");
        }
      }
    });
  }, [walletTypeChanged]);


  function changeSetSelectedChain(value) {
    setSelectedChain(value);
    setChromeStorage('decenterlizedSelectedChain', performEncryption(value));
  }
  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const chainOptions = Object.keys(CHAINS_CONFIG).map((key) => ({
    label: CHAINS_CONFIG[key].name,
    value: key,
  }));

  return (
    <div className="App">
      <Header
        openModal={openModal}
        selectedChain={selectedChain}
        changeSetSelectedChain={changeSetSelectedChain}
        chainOptions={chainOptions}
        isModalVisible={isModalVisible}
        closeModal={closeModal}
        networkName={networkName}
        setNetworkName={setNetworkName}
        networkURL={networkURL}
        setNetworkURL={setNetworkURL}
        chainId={chainId}
        setChainId={setChainId}
        currencySymbol={currencySymbol}
        setCurrencySymbol={setCurrencySymbol}
        handleAddNetwork={handleAddNetwork}
        setWalletTypeChanged={setWalletTypeChanged}
        walletTypeChanged={walletTypeChanged}
      />
      {secureLocalStorage.getItem('walletType') && secureLocalStorage.getItem('walletType') === 'decenterlized' ? (
        <></>) : (
        <CenterlizedRoutes
          wallet={wallet}
          seedParse={seedParse}
          setWallet={setWallet}
          setSeedPharse={setSeedPharse}
          selectedChain={selectedChain}
        />
      )}


      {secureLocalStorage.getItem('walletType') && secureLocalStorage.getItem('walletType') === 'decenterlized' ? (
        <>
          <AuthenticatedRoutes
            wallet={wallet}
            seedParse={seedParse}
            setWallet={setWallet}
            setSeedPharse={setSeedPharse}
            selectedChain={selectedChain}
          />
        </>
      ) : secureLocalStorage.getItem('walletType') === 'centerlized' ? (
        <>
          <SignUp
            setWalletTypeChanged={setWalletTypeChanged}
            setSeedPharse={setSeedPharse}
            setWallet={setWallet}
          >
          </SignUp>
        </>
      ) : secureLocalStorage.getItem('walletType') === 'centerlized-login' ? (
        <>
          <Login
            walletTypeChanged={walletTypeChanged}
            setWalletTypeChanged={setWalletTypeChanged}
            wallet={wallet}
            seedParse={seedParse}
            setWallet={setWallet}
            setSeedPharse={setSeedPharse}
            selectedChain={selectedChain}
          >

          </Login>
        </>
      ) : secureLocalStorage.getItem('walletType') === 'centerlized-done' ? (<></>) : (
        <WalletOptions
          setWalletTypeChanged={setWalletTypeChanged}
        />
      )}

    </div >
  );
}

export default App;