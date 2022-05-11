// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/// @title NFT contract
/// @author https://twitter.com/BossMcBara
contract CardFactory is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public cardMarketplaceAddress;
    mapping(address => uint256) public rewardEligibilityMultiplier;
    mapping(uint256 => string) public nftRarity;
    // NFT's Id --> pack Id to which it belongs
    mapping(uint256 => uint256) public nftIdToPackId;
    // Pack Id --> Owner Address --> number of NFTs owned per that pack. Maximum --> 5
    mapping(uint256 => mapping(address => uint256))
        public numOfNftsOwnedPerPack;

    /// @notice Sets The NFT collection name and symbol on contract creation
    /// @param collectionName The name of the NFT collection
    /// @param collectionSymbol The symbol for the NFT collection
    constructor(string memory collectionName, string memory collectionSymbol)
        ERC721(collectionName, collectionSymbol)
    {}

    /// @notice Sets the NFT marketplace address enabling default approval
    /// @param _marketplaceAddress The address of card NFT marketplace
    function setMarketplaceAddress(address _marketplaceAddress)
        public
        onlyOwner
    {
        cardMarketplaceAddress = _marketplaceAddress;
    }

    /// @notice Any user can call this function to create an NFT. The rarity will only be IRON.
    /// @param tokenUri The URI string to be used for the NFT
    /**  @dev This function will automatically approve a marketplace 
    to sell the created NFT. This enables a NFT owner to easily sell 
    thier NFT if they choose to do so.
    */
    function createNftWithApprovalUser(string memory tokenUri) public {
        _tokenIds.increment();
        nftRarity[_tokenIds.current()] = "Iron";
        _mint(msg.sender, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), tokenUri);
        _approve(cardMarketplaceAddress, _tokenIds.current());
    }

    /// @notice Creates an NFT and approves address to transferNFT.
    /// @param tokenUri The URI string to be used for NFT
    /// @param rarity The rarity associated with the NFT. Rarities: Iron, Gold, Diamond
    /// @param packId The NFT pack Id you'd like the NFT to belong
    /** @param approvedAddress The Address you would like to give rights
    to transfer your NFT. Typically this would be the Marketplace
    address used in tandem with this ERC721 contract. If you would 
    not like to approve address. Use the Ethereum zero address --> address(0)
    */
    function createNFTWithApprovalAdminPack(
        string memory tokenUri,
        string memory rarity,
        uint256 packId,
        address approvedAddress
    ) public onlyOwner {
        _tokenIds.increment();
        nftRarity[_tokenIds.current()] = rarity;
        nftIdToPackId[_tokenIds.current()] = packId;
        numOfNftsOwnedPerPack[packId][msg.sender] += 1;
        _mint(msg.sender, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), tokenUri);
        _approve(approvedAddress, _tokenIds.current());
    }

    /// @notice For admin use only. Creates an NFT with belonging to no pack
    /// @param tokenUri The URI string to be used for NFT
    /// @param rarity The rarity associated with the NFT. Rarities: Iron, Gold, Diamond
    /** @param approvedAddress The Address you would like to give rights
    to transfer your NFT. Typically this would be the Marketplace
    address used in tandem with this ERC721 contract. If you would 
    not like to approve address. Use the Ethereum zero address --> address(0)
    */
    function createSingleNFTWithApprovalAdmin(
        string memory tokenUri,
        string memory rarity,
        address approvedAddress
    ) public onlyOwner {
        _tokenIds.increment();
        nftRarity[_tokenIds.current()] = rarity;
        _mint(msg.sender, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), tokenUri);
        _approve(approvedAddress, _tokenIds.current());
    }

    /** @notice Overrides parent function in order to keep track of how 
    many NFTs a given user has of each pack. Can also be used to transfer
    NFTs that have not been assigned a pack. This applies to all NFTs
    minted from the createNftWithApprovalUser function.
    */
    /// @param from The address from which an NFT is transfered
    /// @param to The address to which the NFT is transfered
    /// @param tokenId The NFT Id a user wishes to transfer
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override nonReentrant {
        uint256 packId = nftIdToPackId[tokenId];
        uint256 packAmount = numOfNftsOwnedPerPack[packId][msg.sender];
        if (packId > 0 && packAmount == 5) {
            numOfNftsOwnedPerPack[packId][to] += 1;
            numOfNftsOwnedPerPack[packId][from] -= 1;
            rewardEligibilityMultiplier[msg.sender] -= 1;
            super._transfer(from, to, tokenId);
        } else if (packId > 0) {
            numOfNftsOwnedPerPack[packId][to] += 1;
            numOfNftsOwnedPerPack[packId][from] -= 1;
            super._transfer(from, to, tokenId);
        } else {
            super._transfer(from, to, tokenId);
        }
    }

    /** @notice Verifies that the caller has a complete NFT pack meaning
    they have all five NFTs from the same pack. If verification is succesful,
    the user will start recieving rewards.
    */
    /// @param packId The NFT pack Id the caller wishes to verify
    function verifyCompletePackOwnerShip(uint256 packId) public {
        uint256 packAmount = numOfNftsOwnedPerPack[packId][msg.sender];
        require(
            packAmount == 5,
            "verifyCompletePackOwnerShip: Sorry, you do not have a complete set :("
        );
        rewardEligibilityMultiplier[msg.sender] += 1;
    }
}
