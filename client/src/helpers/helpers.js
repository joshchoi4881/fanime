const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHP: characterData.maxHP.toNumber(),
    ap: characterData.ap.toNumber(),
  };
};

export { transformCharacterData };
