import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Select from "./components/Select";
import Arena from "./components/Arena";
import Loader from "./components/Loader";
import Fanime from "./utils/Fanime.json";
import { transformCharacterData } from "./helpers/helpers";
import "./styles/App.css";

const REACT_APP_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const FANIME = Fanime.abi;

const DEFAULT_CONTRACT = null;
const DEFAULT_ACCOUNT = null;
const DEFAULT_CHAIN = null;
const DEFAULT_USER_CHARACTER = null;
const DEFAULT_IS_LOADING = false;

const App = () => {
  const [contract, setContract] = useState(DEFAULT_CONTRACT);
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [chain, setChain] = useState(DEFAULT_CHAIN);
  const [userCharacter, setUserCharacter] = useState(DEFAULT_USER_CHARACTER);
  const [isLoading, setIsLoading] = useState(DEFAULT_IS_LOADING);

  useEffect(() => {
    isConnected();
  }, []);

  useEffect(() => {
    if (contract && account && chain === "0x5") {
      getUserCharacter();
    }
  }, [contract, account, chain]);

  const isConnected = async () => {
    function handleAccountsChanged() {
      window.location.reload();
    }
    function handleChainChanged() {
      window.location.reload();
    }
    try {
      if (!window.ethereum) {
        alert("download metamask @ https://metamask.io/download/");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        REACT_APP_CONTRACT_ADDRESS,
        FANIME,
        signer
      );
      setContract(contract);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length !== 0) {
        const account = accounts[0];
        setAccount(account);
      }
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChain(chainId);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("download metamask @ https://metamask.io/download/");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const switchChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }],
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChain(chainId);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserCharacter = async () => {
    const txn = await contract.getUserCharacter();
    if (txn.name) {
      setUserCharacter(transformCharacterData(txn));
    }
  };

  const render = () => {
    if (isLoading) {
      return (
        <>
          <Loader />
        </>
      );
    } else if (!account) {
      return (
        <>
          <div className="connect-wallet-container">
            <img
              src="https://media.giphy.com/media/eSwGh3YK54JKU/giphy.gif"
              alt="anime"
            />
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              connect metamask
            </button>
          </div>
        </>
      );
    } else if (chain !== "0x5") {
      return (
        <>
          <div className="connect-wallet-container">
            <img
              src="https://media.giphy.com/media/eSwGh3YK54JKU/giphy.gif"
              alt="anime"
            />
            <button
              className="cta-button connect-wallet-button"
              onClick={switchChain}
            >
              switch to goerli
            </button>
          </div>
        </>
      );
    } else if (!userCharacter) {
      return (
        <>
          <Select contract={contract} setUserCharacter={setUserCharacter} />
        </>
      );
    } else if (userCharacter) {
      return (
        <>
          <Arena
            contract={contract}
            userCharacter={userCharacter}
            setUserCharacter={setUserCharacter}
          />
        </>
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">fanime</p>
          <p className="sub-text">battle of the animes</p>
          {render()}
        </div>
      </div>
    </div>
  );
};

export default App;
