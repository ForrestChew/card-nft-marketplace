// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol";

/// @title NFT contract
/// @author https://twitter.com/BossMcBara
contract CardFactory is
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard,
    VRFConsumerBaseV2
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address constant VRF_COORDINATOR =
        0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;
    VRFCoordinatorV2Interface COORDINATOR =
        VRFCoordinatorV2Interface(VRF_COORDINATOR);
    bytes32 constant KEY_HASH =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 constant CALL_BACK_GAS_LIMIT = 100000;
    uint64 constant SUBSCRIPTION_ID = 206;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint256 requestId;
    address public cardMarketplaceAddress;
    uint256[] public randomWords;
    address[] public addressesEligibleForRewards;
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
        VRFConsumerBaseV2(VRF_COORDINATOR)
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

    /** @notice Only owner can call this function to distribute rewards amoungst
    reward eligible accounts and who've been selected to win by a Chainlink VRF.
    */
    /// @param _rewardNftIds The NFT Ids that are selected as rewards
    function distributeRewards(uint256[] memory _rewardNftIds)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < randomWords.length; i++) {
            transferFrom(
                address(this),
                addressesEligibleForRewards[randomWords[i]],
                _rewardNftIds[i]
            );
        }
    }

    /** @notice Makes request to Chainlink VRF Oracle to get random number(s).
    These random numbers will be used to select individual NFT's at random as
    a reward for having a complete pack of NFTs.
    */
    /** @dev The amount of random numbers generated will be 1 num for every 5 accounts in
    array that are eligible to win an NFT with an additional number for accounts 1 - 4. 
    */
    function requestRandomWords() external onlyOwner {
        uint32 numWords = uint32(addressesEligibleForRewards.length) / 5 + 1;
        requestId = COORDINATOR.requestRandomWords(
            KEY_HASH,
            SUBSCRIPTION_ID,
            REQUEST_CONFIRMATIONS,
            CALL_BACK_GAS_LIMIT,
            numWords
        );
    }

    /// @notice Fulfills randomness and assigns storage array to returned random numbers
    function fulfillRandomWords(uint256, uint256[] memory _randomWords)
        internal
        override
    {
        for (uint256 i = 0; i < _randomWords.length; i++) {
            _randomWords[i] =
                randomWords[i] %
                addressesEligibleForRewards.length;
        }
        randomWords = _randomWords;
    }
}