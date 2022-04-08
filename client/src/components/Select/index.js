import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { transformCharacterData } from "../../helpers/helpers";
import "./select.css";

const Select = ({ contract, setPlayerCharacter }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCharacters();
    contract.on("NewMint", onNewMint);
    return () => {
      contract.off("NewMint", onNewMint);
    };
  }, []);

  const getCharacters = async () => {
    try {
      const txn = await contract.getCharacters();
      const characters = txn.map((character) =>
        transformCharacterData(character)
      );
      setCharacters(characters);
    } catch (error) {
      console.error(error);
    }
  };

  const mint = async (characterId) => {
    try {
      setLoading(true);
      const txn = await contract.mint(characterId);
      await txn.wait();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onNewMint = async (sender, tokenId, characterId) => {
    try {
      const playerCharacter = await contract.getPlayerCharacter();
      setPlayerCharacter(transformCharacterData(playerCharacter));
    } catch (error) {
      console.error(error);
    }
  };

  const renderCharacters = () =>
    characters.map((character, id) => (
      <div className="character-item" key={id}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mint(id)}
        >{`mint ${character.name}`}</button>
      </div>
    ));

  return (
    <div className="select-character-container">
      <h2>mint a character nft</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {loading && (
        <div className="loading">
          <div className="indicator">
            <Loader />
            <p>minting...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="loading"
          />
        </div>
      )}
    </div>
  );
};

export default Select;
