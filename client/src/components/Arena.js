import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { transformCharacterData } from "../helpers/helpers";
import "../styles/Arena.css";

const Arena = ({ contract, userCharacter, setUserCharacter }) => {
  const [boss, setBoss] = useState({});
  const [loadState, setLoadState] = useState("");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    getBoss();
    contract.on("NewAttack", onNewAttack);
    return () => {
      contract.off("NewAttack", onNewAttack);
    };
  }, []);

  const getBoss = async () => {
    let txn = await contract.getBoss();
    setBoss(transformCharacterData(txn));
  };

  const attack = async () => {
    try {
      setLoadState("attacking");
      let txn = await contract.attack();
      await txn.wait();
      setLoadState("hit");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      setLoadState("");
    }
  };

  const onNewAttack = (sender, characterHP, bossHP) => {
    setUserCharacter((prev) => {
      return { ...prev, hp: characterHP.toNumber() };
    });
    setBoss((prev) => {
      return { ...prev, hp: bossHP.toNumber() };
    });
  };

  return (
    <div className="arena-container">
      {userCharacter && boss && (
        <div id="toast" className={toast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} lost ${userCharacter.ap} hp`}</div>
        </div>
      )}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content  ${loadState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHP} />
                <p>{`${boss.hp} / ${boss.maxHP} hp`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={attack}>
              {`💥 attack ${boss.name}`}
            </button>
          </div>
          {loadState === "attacking" && (
            <div className="loading-indicator">
              <Loader />
              <p>attacking...</p>
            </div>
          )}
        </div>
      )}
      {userCharacter && (
        <div className="players-container">
          <div className="player-container">
            <h2>your character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{userCharacter.name}</h2>
                <img
                  src={userCharacter.imageURI}
                  alt={`${userCharacter.name}`}
                />
                <div className="health-bar">
                  <progress
                    value={userCharacter.hp}
                    max={userCharacter.maxHP}
                  />
                  <p>{`${userCharacter.hp} / ${userCharacter.maxHP} hp`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`attack power: ${userCharacter.ap}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
