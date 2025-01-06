import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import RecoverAccount from "./RecoverAccount";
import CreateAccount from "./CreateAccount";
import WalletView from "./WalletView";
import secureLocalStorage from "react-secure-storage";

function AuthenticatedRoutes({ wallet, seedParse, setWallet, setSeedPharse, selectedChain }) {
    return (
        <Routes>
            {wallet && seedParse && secureLocalStorage.getItem('walletType') === 'decenterlized' ? (
                <Route
                    path="/yourwallet"
                    element={<WalletView wallet={wallet} setWallet={setWallet} seedParse={seedParse} setSeedPharse={setSeedPharse} selectedChain={selectedChain} />}
                />
            ) : (
                <>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/recover"
                        element={<RecoverAccount setWallet={setWallet} setSeedPharse={setSeedPharse} />}
                    />
                    <Route
                        path="/yourwallet"
                        element={<CreateAccount setWallet={setWallet} setSeedPharse={setSeedPharse} />}
                    />
                </>
            )}
        </Routes>
    );
}

export default AuthenticatedRoutes;
