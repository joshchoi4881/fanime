// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import {Base64} from "./libraries/Base64.sol";

contract Fanime is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    struct Character {
        uint256 characterId;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHP;
        uint256 ap;
    }
    Character[] private characters;
    struct Boss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHP;
        uint256 ap;
    }
    Boss private boss;
    mapping(address => uint256) private userIds;
    mapping(uint256 => Character) private userCharacters;
    event NewMint(address sender, uint256 tokenId, uint256 characterId);
    event NewAttack(address sender, uint256 characterHP, uint256 bossHP);

    constructor(
        string[] memory _characterNames,
        string[] memory _characterImageURIs,
        uint256[] memory _characterHPs,
        uint256[] memory _characterAPs,
        string memory _bossName,
        string memory _bossImageURI,
        uint256 _bossHP,
        uint256 _bossAP
    ) ERC721("Fanime", "FNM") {
        tokenId.increment();
        for (uint256 i = 0; i < _characterNames.length; i += 1) {
            characters.push(
                Character({
                    characterId: i,
                    name: _characterNames[i],
                    imageURI: _characterImageURIs[i],
                    hp: _characterHPs[i],
                    maxHP: _characterHPs[i],
                    ap: _characterAPs[i]
                })
            );
        }
        boss = Boss({
            name: _bossName,
            imageURI: _bossImageURI,
            hp: _bossHP,
            maxHP: _bossHP,
            ap: _bossAP
        });
    }

    function mint(uint256 _characterId) external {
        uint256 _tokenId = tokenId.current();
        _safeMint(msg.sender, _tokenId);
        userIds[msg.sender] = _tokenId;
        userCharacters[_tokenId] = Character({
            characterId: _characterId,
            name: characters[_characterId].name,
            imageURI: characters[_characterId].imageURI,
            hp: characters[_characterId].hp,
            maxHP: characters[_characterId].maxHP,
            ap: characters[_characterId].ap
        });
        tokenId.increment();
        emit NewMint(msg.sender, _tokenId, _characterId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        Character memory character = userCharacters[_tokenId];
        string memory hp = Strings.toString(character.hp);
        string memory maxHP = Strings.toString(character.maxHP);
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
                maxHP,
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

    function attack() external {
        uint256 userId = userIds[msg.sender];
        Character storage player = userCharacters[userId];
        require(player.hp > 0, "error: player is defeated");
        require(boss.hp > 0, "error: boss is defeated");
        if (player.hp < boss.ap) {
            player.hp = 0;
        } else {
            player.hp = player.hp - boss.ap;
        }
        if (boss.hp < player.ap) {
            boss.hp = 0;
        } else {
            boss.hp = boss.hp - player.ap;
        }
        emit NewAttack(msg.sender, player.hp, boss.hp);
    }

    function getCharacters() external view returns (Character[] memory) {
        return characters;
    }

    function getUserCharacter() external view returns (Character memory) {
        uint256 userId = userIds[msg.sender];
        if (userId > 0) {
            return userCharacters[userId];
        } else {
            Character memory empty;
            return empty;
        }
    }

    function getBoss() external view returns (Boss memory) {
        return boss;
    }
}
