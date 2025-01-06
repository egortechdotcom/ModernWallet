import { ImportOutlined, LogoutOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { GoCopy } from "react-icons/go";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/noImg.png";
import axios from "axios";
import { CHAINS_CONFIG } from "../../chains";
import transferLogo from "../../assets/transfer.png";
import receiveLogo from "../../assets/receive.png";
import loaderPpins from "../../assets/loader-pins.svg";
import erc20Abi from '../../abi/erc-20.json';
import secureLocalStorage from "react-secure-storage";
import pngImg from "../../assets/newPic.png";
import { v4 as uuidv4 } from "uuid";


import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button
} from "antd";
import { ethers, HDNodeWallet, Mnemonic } from "ethers";
import Modal from "antd/es/modal/Modal";
import ModalComponent from ".././modal";
import { performEncryption } from "../../helpers/cryptoHelper";

function WalletView(
  {
    wallet,
    setWallet,
    seedParse,
    setSeedPharse,
    selectedChain
  }
) {
  console.log(`sasdasd ${CHAINS_CONFIG}`);
  console.log(`se ${selectedChain}`);




  const navigate = useNavigate();
  let [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendAddress, setSendAddress] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [hash, setHash] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [copiedState, setCopiedState] = useState('Copy to clipboard');

  const [transferData, setTransferData] = useState(null);

  const [errorLog, setErrorLog] = useState(null);
  const [errorMessageTxt, setErrorMessageTxt] = useState(null);



  /* Import Account  */
  const [privateKey, setPrivateKey] = useState('');

  const [accountOpen, setAccountOpen] = useState(false);
  const [openAccountConfirm, setOpenAccountConfirm] = useState(false);
  const [accountModelText, setAccountModelText] = useState('Content of the modal');

  /**Add account state */
  const [importOpen, setImportOpen] = useState(false);
  const [openImportConfirm, setOpenImportConfirm] = useState(false);
  const [importModelText, setImportModelText] = useState('Content of the modal');


  const [accountList, setAccountList] = useState([
    // { name: 'Account 1', address: '0x123...', balance: '10 ETH' },
  ]);

  /**
   * Add Account Modal
   */
  const [newAccountName, setNewAccountName] = useState(null);
  const [accountModalState, setaccountModalState] = useState(false);
  const [accountModalConfirm, setaccountModalConfirm] = useState(false);

  const [accountModalInputState, setaccountModalInputState] = useState(null);
  const [accountModalInputConfirm, setaccountModalInputConfirm] = useState(false);




  const handleAccountOpenInputOk = () => {
    try {

      const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16))
      console.log(`mnemonic ${mnemonic}`);
      const mnemonicInstance = Mnemonic.fromPhrase(mnemonic);
      const wallet = HDNodeWallet.fromMnemonic(mnemonicInstance, `m/44'/60'/0'/0/0`);
      setAccountList(prevAccountList => {
        const updatedList = [
          ...prevAccountList,
          {
            id: uuidv4(),
            name: newAccountName,
            address: wallet.address,
            balance: 0.00000
          }
        ]
        axios.post(`http://localhost:3001/setSecret`, {
          name: secureLocalStorage.getItem('email'),
          value: performEncryption(JSON.stringify(updatedList))
        })
          .then(response => {
            console.log('Secret updated:', response.data);
          })
          .catch(error => {
            console.error('Error secret:', error);
          });

        secureLocalStorage.setItem('accountList', JSON.stringify(updatedList));
        return updatedList;

      });

      setNewAccountName(null);
      setaccountModalInputState(false);
      setAccountOpen(true);

    } catch (error) {
      console.log(error);
    }
  }
  const handleAccountOpenInputCancel = () => {
    setaccountModalInputState(false);
    setaccountModalState(true);
  }

  const handleAccountOpenOk = () => {
  }
  const handleAccountOpenCancel = () => {
    setaccountModalState(false);
    setAccountOpen(true);
  }
  const openImportModal = () => {
    setImportOpen(true);
    setaccountModalState(false);
  }
  const openNewAccountInput = () => {
    setaccountModalInputState(true);
    setaccountModalState(false);
  }

  /**
   * Add Account Modal
   */
  const [selectedAccount, setSelectedAccount] = useState(null);
  const showModal = () => {
    setAccountOpen(true);
    setImportOpen(false);
  };

  const accountModal = () => {
    setAccountOpen(false);
    // setImportOpen(true);
    setaccountModalState(true);
  };
  /**Import Start */
  useEffect(() => {
    let accountList = secureLocalStorage.getItem("accountList");
    if (accountList) {
      setAccountList(JSON.parse(accountList));
    }
  }, []);


  const handleImportOk = async () => {
    try {
      setOpenImportConfirm(true);
      const provider = new ethers.JsonRpcProvider(CHAINS_CONFIG[selectedChain].rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      const res = await axios.get(` /getTokens`, {
        params: {
          userAddress: wallet.address,
          chain: selectedChain
        }
      });
      const data = res.data;

      setAccountList(prevAccountList => {
        const updatedList = [
          ...prevAccountList,
          {
            id: uuidv4(),
            name: `Account ${prevAccountList.length + 1}`,
            address: wallet.address,
            balance: data.balance
          }
        ]
        secureLocalStorage.setItem('accountList', JSON.stringify(updatedList));
        return updatedList;

      });

      const resReturn = {
        address: wallet.address,
        balance: data.balance,
        privateKey: privateKey
      };

      setPrivateKey('');
      setAccountOpen(true);
      setImportOpen(false);
      setOpenImportConfirm(false);

      return resReturn;

    } catch (error) {
      console.error("Error importing account:", error);
      throw error;
    }
  }
  const handleImportCancel = () => {
    console.log('Clicked cancel button');
    setImportOpen(false);
    setaccountModalState(true)

  }

  /**Import Endc */

  /**Handle  */
  const handleAccountOk = () => {
    setAccountModelText('The modal will be closed after two seconds');
    setOpenAccountConfirm(true);
    setTimeout(() => {
      setAccountOpen(false);
      // setOpenAccountConfirm(false);
    }, 2000);
  };
  const handleAccountCancel = () => {
    setAccountOpen(false);
  };

  useEffect(() => {
    if (wallet !== null) {
      getAccountToken();
      getTransactionHistory();
      navigate('/centerlized-wallet-view');
    }
  }, [wallet]);

  /**Handle account selection */
  const handleAccountList = (item) => {
    setSelectedAccount(item.id);
    secureLocalStorage.setItem('wallet', item.address);
    setAccountOpen(false);
    setWallet(item.address);
    console.log(item.address);
    console.log(`wallet ${wallet}`);
  }
  /**Handle account selection end */

  /**Import Account end  */
  const items = [
    {
      key: "3",
      label: `Token`,
      children: (
        <>
          {(tokens ? (
            <>
              <List
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div>
                      {(
                        Number(item.balance) /
                        10 ** Number(item.decimals)
                      ).toFixed(2)}{" "}
                      Tokens

                    </div>
                  </List.Item>

                )}
              />

            </>
          ) : (
            <>
              <span>
                You does not have any token yet
              </span>
            </>
          ))}
          <Divider />
          <div className="sendRow">
            <Input
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
            />
            <Button
              type="primary"
              onClick={() => importToken(contractAddress)}
            >
              Import Token
            </Button>
          </div>

        </>
      )
    },
    {
      key: "2",
      label: `NFTs`,
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => {
                return (
                  <>
                    {e && (
                      <img
                        key={i}
                        className="nftImage"
                        alt="nftImage"
                        src={e}
                      />
                    )}
                  </>
                );
              })}
            </>
          ) : (
            <>
              <span>You seem to not have any NFTs yet</span>
              <p className="frontPageBottom">
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Transfer`,
      children: (
        <>
          <h1 className="txnBalanceText">
            {balance.toFixed(5)} {CHAINS_CONFIG[selectedChain].ticker}
          </h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>To: </p>
            <Input
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>Amount: </p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Enter amount to send"
            />
          </div>
          {processing && (
            <>
              <Spin />
              {hash && (
                <Tooltip title={hash}>
                  Hover for Tx Hash
                </Tooltip>
              )}
            </>
          )}

          {errorLog && <p style={{ color: 'red' }}>{errorMessageTxt}</p>}
          <Button
            type="primary"
            onClick={() => sendTransaction(sendAddress, amountToSend)}
          >

            Send Tokens
          </Button>
          <Divider />
          <>
            {transferData ? (<List
              itemLayout="horizontal"
              dataSource={transferData}
              renderItem={(item, index) => (
                item.from_address.toString().toLocaleLowerCase() === wallet.toString().toLocaleLowerCase() ? (
                  <a href={`${CHAINS_CONFIG[selectedChain].txnURL}/${item.hash}`} target="_blank" rel="noreferrer">
                    <List.Item style={{ textAlign: "left" }}
                      className={item.status === 'pending' ? 'txnHistorySection pending' : 'txnHistorySection'}>
                      <List.Item.Meta
                        avatar={<Avatar src={item.status === 'pending' ? item.loaderPpins : transferLogo} className="txnImage" />}
                        title={'Send'}
                        description={item.status === 'pending' ? 'Pending' : 'Confirmed'}
                      />
                      <div className="dateSecion">
                        {((+item.value) / 10 ** 18).toFixed(5)}{" "}
                        {CHAINS_CONFIG[selectedChain].ticker}
                        <br />
                        <span className="dateTxn">
                          {new Date(item.block_timestamp).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}

                        </span>
                      </div>
                    </List.Item>
                  </a>
                ) : (
                  <a href={`${CHAINS_CONFIG[selectedChain].txnURL}/${item.hash}`} target="_blank" rel="noreferrer">
                    <List.Item style={{ textAlign: "left" }} className='txnHistorySection'>
                      <List.Item.Meta
                        avatar={<Avatar src={receiveLogo} className="txnImage" />}
                        title={'Receive'}
                        description={'Confirmed'}
                      />
                      <div className="dateSecion">
                        {((+item.value) / 10 ** 18).toFixed(5)}{" "}
                        {CHAINS_CONFIG[selectedChain].ticker}
                        <br />
                        <span className="dateTxn">
                          {new Date(item.block_timestamp).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>

                      </div>
                    </List.Item>
                  </a>
                )
              )}
            />) : ('')}
          </>
        </>
      )
    }
  ];



  async function getAccountToken() {

    setFetching(true);
    setErrorLog(false);

    const res = await axios.get(`http://localhost:3001/getTokens`, {
      params: {
        userAddress: wallet,
        chain: selectedChain
      }
    });

    const response = res.data;

    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }

    if (response.nfts.length > 0) {
      setNfts(response.nfts);
    }
    setFetching(false);
    setBalance(response.balance);
  }

  async function importToken(address) {
    const provider = new ethers.JsonRpcProvider(CHAINS_CONFIG[selectedChain].rpcUrl);
    const contractInstance = new ethers.Contract(address, erc20Abi, provider);
    let contractData = {
      balance: await contractInstance.balanceOf(address),
      decimals: await contractInstance.decimals(),
      symbol: await contractInstance.symbol(),
      name: await contractInstance.name()
    };
    console.log(tokens);
    if (!tokens) {
      tokens = [];
    }
    if (tokens) {
      tokens.push(contractData);
    }
    setTokens(tokens);
    setContractAddress(null);
  }

  async function sendTransaction(to, amount) {
    setErrorLog(false);
    setErrorMessageTxt('');
    const chain = CHAINS_CONFIG[selectedChain];
    console.log(chain);
    console.log(`amount ${amount.toString()}`);
    let transferDataTemp = [
      {
        "from_address": wallet,
        "to_address": to,
        "value": (+amount) * (10 * 18),
        "block_timestamp": new Date(),
        "status": "pending",
        "loaderPpins": loaderPpins
      },
      ...transferData,
    ];
    console.log(transferDataTemp);
    setTransferData(transferDataTemp);

    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const privateKey = ethers.Wallet.fromPhrase(seedParse).privateKey;
    const walletTxn = new ethers.Wallet(privateKey, provider);


    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString())
    };
    console.log(tx);
    setProcessing(true);
    try {

      const transaction = await walletTxn.sendTransaction(tx);
      setHash(transaction.hash);
      const receipt = provider.waitForTransaction(transaction.hash, 1, 150000)
        .then((receipt) => {
          getAccountToken();
          setTimeout(() => {
            getTransactionHistory();
          }, 1500);
        })
        .catch((error) => {
          setErrorLog(true);
          setErrorMessageTxt(error);
          console.error(error);
        });


      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendAddress(null);
      if (receipt.status === 1) {
        getAccountToken();
      } else {
        console.log('Failed');
      }

    } catch (error) {
      console.log(error);
      console.log(error.code)
      setErrorLog(true);
      setErrorMessageTxt(
        getErrorMessage(error.code)
      );
      setTransferData(transferData);
      setAmountToSend(null);
      setSendAddress(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendAddress(null);
    }
  }


  function getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds for intrinsic transaction cost';
      case 'UNSUPPORTED_OPERATION':
        return 'Network does not support ENS ';
      default: return '';
    }
  }


  async function getTransactionHistory(address, chain) {
    // setFetching(true);
    const res = await axios.get(`http://localhost:3001/getWalletTransaction`, {
      params: {
        userAddress: wallet,
        chain: selectedChain
      }
    });

    const response = res.data;
    setTransferData(response.data.result);
    setFetching(false);
  }
  function logout() {
    setSeedPharse(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    secureLocalStorage.removeItem('wallet');
    secureLocalStorage.removeItem('seedParse');
    navigate('/');
  }

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountToken();
    getTransactionHistory();
  }, []);


  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountToken();
    getTransactionHistory();
  }, [selectedChain]);


  // const notify = () =>;


  return (
    <>
      <div className="content">
        <div className="logoutButton"
          onClick={logout}>
          <LogoutOutlined />
        </div>
        <Button type="" onClick={showModal}>
          Account  &#9660;
        </Button>

        <Modal
          className="accountOpenModal"
          title="Select an account"
          open={accountOpen}
          onOk={handleAccountOk}
          confirmLoading={openAccountConfirm}
          onCancel={handleAccountCancel}
          width={350}
          style={{ top: '15px', textAlign: 'center' }}
        >
          <p style={{ textAlign: 'center' }}>
            <Input
              placeholder="Search account"
              prefix={<SearchOutlined />}
            />
            {
              /* 
                Need unique item id
              */
            }
            <List
              dataSource={accountList}
              className="accountList"
              renderItem={item => (
                <List.Item
                  className={`importedAccounts ${selectedAccount === item.id ? 'selected' : ''}`}
                  key={item.id}
                  id={`item_${item.id}`}
                  onClick={() => handleAccountList(item)}
                >
                  <div className="imageSection">
                    <img src={pngImg}></img>
                    <div>
                      <h2>{item.name}</h2>
                      <p> {item.address.slice(0, 6)}...{item.address.slice(38)}</p>
                    </div>
                  </div>
                  <div>
                    <span>{item.balance}</span>
                  </div>
                </List.Item>
              )}
            />
            <hr />
            <Button
              type="primary"
              shape="round"
              style={{ marginTop: '2rem' }}
              icon={<PlusOutlined />}
              onClick={accountModal}
              className="importBtn"
            >
              Add account
            </Button>

          </p>

        </Modal>

        <ModalComponent
          title={"Import Account"}
          open={importOpen}
          handleOk={handleImportOk}
          confirmLoading={openImportConfirm}
          handleCancel={handleImportCancel}
        >
          <p style={{ textAlign: 'center' }}>
            Enter your private key string here:
            <Input
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
          </p>
        </ModalComponent>



        <ModalComponent
          title={"Add Account"}
          open={accountModalState}
          handleOk={handleAccountOpenOk}
          confirmLoading={accountModalConfirm}
          handleCancel={handleAccountOpenCancel}
        >
          <hr />
          <div className="addAccountContainer">
            <Button
              style={{ width: '100%', textAlign: 'left' }}
              icon={<PlusOutlined />}
              onClick={openNewAccountInput}
            >
              Add a new account
            </Button>
            <Button
              style={{ width: '100%', textAlign: 'left' }}
              icon={<ImportOutlined />}
              onClick={openImportModal}
            >
              Import account
            </Button>
          </div>
        </ModalComponent>


        <ModalComponent
          title={"Add Account"}
          open={accountModalInputState}
          handleOk={handleAccountOpenInputOk}
          confirmLoading={accountModalInputConfirm}
          handleCancel={handleAccountOpenInputCancel}
        >
          <hr />
          <div>
            Account name
            <Input
              placeholder="Enter account name"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            ></Input>

          </div>
        </ModalComponent>





        <Tooltip
          title={copiedState}
        >
          <span className="publicAddress">
            {wallet.slice(0, 6)}...{wallet.slice(38)}
            <CopyToClipboard
              text={wallet}
              onCopy={() => setCopiedState('Copied')}>
              <GoCopy />
            </CopyToClipboard>
          </span>

        </Tooltip>

        <Divider className="headerDivide" />
        {fetching ? (
          <>
            <Spin />
          </>
        ) : (
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="walletView"

          />
        )}

      </div >
    </>
  );
}
export default WalletView;


/***
 * 
 * waiting > pending
 * approved > pending
 * moderate > draft
 * published > publish
 * + delete => trash
 * 
 * 
 */