import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { transformCharacterData } from "../../helpers/helpers";
import "./arena.css";

const Arena = ({ contract, playerCharacter, setPlayerCharacter }) => {
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
    const txn = await contract.getBoss();
    setBoss(transformCharacterData(txn));
  };

  const attack = async () => {
    try {
      setLoadState("attacking");
      const txn = await contract.attack();
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

  const onNewAttack = (newBossHp, newPlayerHp) => {
    const bossHp = newBossHp.toNumber();
    const playerHp = newPlayerHp.toNumber();
    setBoss((prev) => {
      return { ...prev, hp: bossHp };
    });
    setPlayerCharacter((prev) => {
      return { ...prev, hp: playerHp };
    });
  };

  return (
    <div className="arena-container">
      {playerCharacter && boss && (
        <div id="toast" className={toast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} lost ${playerCharacter.ap} hp`}</div>
        </div>
      )}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content  ${loadState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} hp`}</p>
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
      {playerCharacter && (
        <div className="players-container">
          <div className="player-container">
            <h2>your character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{playerCharacter.name}</h2>
                <img
                  src={playerCharacter.imageURI}
                  alt={`${playerCharacter.name}`}
                />
                <div className="health-bar">
                  <progress
                    value={playerCharacter.hp}
                    max={playerCharacter.maxHp}
                  />
                  <p>{`${playerCharacter.hp} / ${playerCharacter.maxHp} hp`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`attack power: ${playerCharacter.ap}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
