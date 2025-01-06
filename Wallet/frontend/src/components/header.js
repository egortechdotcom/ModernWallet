import React from "react";
import logo from "../assets/NarutoIcon.jpeg";
import { PlusCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { Select, Modal, Input, Button } from "antd";
import secureLocalStorage from "react-secure-storage";
import { removeStorageKey } from "../helpers/chromeStorage";
import { useNavigate } from "react-router-dom";



function Header({
    openModal,
    selectedChain,
    changeSetSelectedChain,
    chainOptions,
    isModalVisible,
    closeModal,
    networkName,
    setNetworkName,
    networkURL,
    setNetworkURL,
    chainId,
    setChainId,
    currencySymbol,
    setCurrencySymbol,
    handleAddNetwork,
    setWalletTypeChanged,
    walletTypeChanged
}) {
    const navigate = useNavigate();
    const handleResetWalletOption = () => {
        setWalletTypeChanged(false);
        secureLocalStorage.removeItem('walletType');
        secureLocalStorage.removeItem('walletType');
        removeStorageKey(['walletType']).then(() => {
            navigate('/');
        }).catch();

    }
    return (
        <header>
            <img src={logo} className="headerLogo" alt="logo" />
            <div className="addNetIcon">
                <PlusCircleOutlined style={{ float: "right" }} onClick={openModal} />
                <Select
                    onChange={(val) => changeSetSelectedChain(val)}
                    value={selectedChain}
                    options={chainOptions}
                    className="dropdown"
                ></Select>
                <RollbackOutlined onClick={handleResetWalletOption} />

                <Modal
                    className="addNetwork"
                    title="Add Account"
                    visible={isModalVisible}
                    onCancel={closeModal}
                    footer={null}
                >
                    <hr />
                    <div>
                        <label>Network Name</label>
                        <Input
                            placeholder="Enter Network Name"
                            value={networkName}
                            onChange={(e) => setNetworkName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Network URL</label>
                        <Input
                            placeholder="Enter Network URL"
                            value={networkURL}
                            onChange={(e) => setNetworkURL(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Chain ID</label>
                        <Input
                            placeholder="Enter Chain ID"
                            value={chainId}
                            onChange={(e) => setChainId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Currency Symbol</label>
                        <Input
                            placeholder="Enter Currency Symbol"
                            value={currencySymbol}
                            onChange={(e) => setCurrencySymbol(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddNetwork} type="primary">
                        Add Network
                    </Button>
                </Modal>
            </div>
        </header>
    );
}


export default Header;
