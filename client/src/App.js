import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Select from "./Components/Select";
import Arena from "./Components/Arena";
import Loader from "./Components/Loader";
import Fanime from "./utils/Fanime.json";
import { transformCharacterData } from "./helpers/helpers";
import "./styles/App.css";

const REACT_APP_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const FANIME = Fanime.abi;

const App = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [chain, setChain] = useState(null);
  const [playerCharacter, setPlayerCharacter] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isConnected();
  }, []);

  useEffect(() => {
    if (contract && account && chain === "0x4") {
      getPlayerCharacter();
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
        alert("download metamask");
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
        alert("download metamask");
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
        params: [{ chainId: "0x4" }],
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChain(chainId);
    } catch (error) {
      console.error(error);
    }
  };

  const getPlayerCharacter = async () => {
    const txn = await contract.getPlayerCharacter();
    if (txn.name) {
      setPlayerCharacter(transformCharacterData(txn));
    }
  };

  const render = () => {
    if (loading) {
      return <Loader />;
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
    } else if (chain !== "0x4") {
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
              switch to rinkeby
            </button>
          </div>
        </>
      );
    } else if (account && !playerCharacter) {
      return (
        <Select contract={contract} setPlayerCharacter={setPlayerCharacter} />
      );
    } else if (account && playerCharacter) {
      return (
        <Arena
          contract={contract}
          playerCharacter={playerCharacter}
          setPlayerCharacter={setPlayerCharacter}
        />
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
