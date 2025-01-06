import { Routes, Route } from "react-router-dom";
import CreateAccount from "./components/centerlized/generateSeedPharse";
import WalletView from "./components/centerlized/WalletView";

function CenterlizedRoutes({ wallet, seedParse, setWallet, setSeedPharse, selectedChain }) {
    return (
        <Routes>
            <>
                <Route
                    path="/centerlized-generate-seed"
                    element={<CreateAccount setWallet={setWallet} setSeedPharse={setSeedPharse} />}
                />

                <Route
                    path="/centerlized-wallet-view"
                    element={<WalletView wallet={wallet} setWallet={setWallet} seedParse={seedParse} setSeedPharse={setSeedPharse} selectedChain={selectedChain} />}
                />
            </>
        </Routes>
    );
}

export default CenterlizedRoutes;
