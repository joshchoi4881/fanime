// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Base64.sol";
import "hardhat/console.sol";

contract Fanime is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    struct Character {
        uint256 characterId;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 ap;
    }
    Character[] characters;
    struct Boss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 ap;
    }
    Boss public boss;
    mapping(address => uint256) public playerIds;
    mapping(uint256 => Character) public playerCharacters;
    event NewMint(address sender, uint256 tokenId, uint256 characterId);
    event NewAttack(uint256 newBossHp, uint256 newPlayerHp);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHps,
        uint256[] memory characterAps,
        string memory bossName,
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAp
    ) ERC721("Fanime", "FNM") {
        boss = Boss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            ap: bossAp
        });
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            characters.push(
                Character({
                    characterId: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHps[i],
                    maxHp: characterHps[i],
                    ap: characterAps[i]
                })
            );
        }
        tokenId.increment();
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        Character memory character = playerCharacters[_tokenId];
        string memory hp = Strings.toString(character.hp);
        string memory maxHp = Strings.toString(character.maxHp);
        string memory ap = Strings.toString(character.ap);
        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                character.name,
                '", "description": "Fanime NFT player", "image": "',
                character.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                hp,
                ', "max_value":',
                maxHp,
                '}, { "trait_type": "Attack Power", "value": ',
                ap,
                "} ]}"
            )
        );
        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    function getPlayerCharacter() public view returns (Character memory) {
        uint256 playerId = playerIds[msg.sender];
        if (playerId > 0) {
            return playerCharacters[playerId];
        } else {
            Character memory empty;
            return empty;
        }
    }

    function mint(uint256 _characterId) external {
        uint256 _tokenId = tokenId.current();
        _safeMint(msg.sender, _tokenId);
        playerCharacters[_tokenId] = Character({
            characterId: _characterId,
            name: characters[_characterId].name,
            imageURI: characters[_characterId].imageURI,
            hp: characters[_characterId].hp,
            maxHp: characters[_characterId].maxHp,
            ap: characters[_characterId].ap
        });
        playerIds[msg.sender] = _tokenId;
        tokenId.increment();
        emit NewMint(msg.sender, _tokenId, _characterId);
    }

    function attack() public {
        uint256 playerId = playerIds[msg.sender];
        Character storage player = playerCharacters[playerId];
        require(player.hp > 0, "error: player is defeated");
        require(boss.hp > 0, "error: boss is already defeated");
        if (boss.hp < player.ap) {
            boss.hp = 0;
        } else {
            boss.hp = boss.hp - player.ap;
        }
        if (player.hp < boss.ap) {
            player.hp = 0;
        } else {
            player.hp = player.hp - boss.ap;
        }
        emit NewAttack(boss.hp, player.hp);
    }

    function getCharacters() public view returns (Character[] memory) {
        return characters;
    }

    function getBoss() public view returns (Boss memory) {
        return boss;
    }
}
