// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

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
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 immutable KEY_HASH;
    uint32 immutable CALL_BACK_GAS_LIMIT;
    uint64 immutable SUBSCRIPTION_ID;
    uint16 immutable REQUEST_CONFIRMATIONS;
    uint256 requestId;
    address public cardMarketplaceAddress;
    uint256[] public randomWords;
    address[] public addressesEligibleForRewards;
    // NFT rarity is not defined in the JSON schema as the rarity may change
    mapping(uint256 => string) public nftRarity;
    // NFT's Id --> set Id to which it belongs
    mapping(uint256 => uint256) public nftIdToPackId;
    // Set Id --> Owner Address --> number of NFTs owned per that pack. Maximum --> 5
    mapping(uint256 => mapping(address => uint256))
        public numOfNftsOwnedPerPack;

    /// @notice Sets The NFT collection name and symbol on contract creation
    /// @param collectionName The name of the NFT collection
    /// @param collectionSymbol The symbol for the NFT collection
    constructor(
        string memory collectionName,
        string memory collectionSymbol,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint64 _subscriptionId,
        uint16 _requestConfirmations
    )
        ERC721(collectionName, collectionSymbol)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        KEY_HASH = _keyHash;
        CALL_BACK_GAS_LIMIT = _callbackGasLimit;
        SUBSCRIPTION_ID = _subscriptionId;
        REQUEST_CONFIRMATIONS = _requestConfirmations;
    }

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

    /// @notice For admin use only. Creates an NFT belonging to no pack
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

    /// @notice For admin use only. Creates an NFT soley for a reward
    /// @param tokenUri The URI string to be used for NFT
    /// @param rarity The rarity associated with the NFT. Rarities: Iron, Gold, Diamond
    /** @param approvedAddress The Address you would like to give rights
    to transfer your NFT. Typically this would be the Marketplace
    address used in tandem with this ERC721 contract. If you would 
    not like to approve address. Use the Ethereum zero address --> address(0)
    */
    function createNFTWithApprovalAdminForReward(
        string memory tokenUri,
        string memory rarity,
        address approvedAddress
    ) public onlyOwner {
        _tokenIds.increment();
        nftRarity[_tokenIds.current()] = rarity;
        _mint(address(this), _tokenIds.current());
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
        uint256 packAmount = numOfNftsOwnedPerPack[packId][from];
        if (packId > 0 && packAmount == 5) {
            numOfNftsOwnedPerPack[packId][to] += 1;
            numOfNftsOwnedPerPack[packId][from] -= 1;
            super._transfer(from, to, tokenId);
            _removeEligibilityMultiplier(from);
        } else if (packId > 0) {
            numOfNftsOwnedPerPack[packId][to] += 1;
            numOfNftsOwnedPerPack[packId][from] -= 1;
            super._transfer(from, to, tokenId);
        } else {
            super._transfer(from, to, tokenId);
        }
    }

    /** @notice Verifies that the caller has a complete NFT set meaning
    they have all five NFTs from the same set. If verification is succesful,
    the user is eligible for rewards.
    */
    /// @param setId The NFT set Id the caller wishes to verify
    function verifyCompletePackOwnerShip(uint256 setId) public {
        uint256 setAmount = numOfNftsOwnedPerPack[setId][msg.sender];
        require(
            setAmount == 5,
            "verifyCompletePackOwnerShip: Sorry, you do not have a complete set :("
        );
        addressesEligibleForRewards.push(msg.sender);
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
        randomWords = _randomWords;
        for (uint256 i = 0; i < randomWords.length; i++) {
            // Random words are in the range of 0 --> length of eligible addresses
            randomWords[i] =
                randomWords[i] %
                addressesEligibleForRewards.length;
        }
    }

    /// @notice Removes an instance of target address from eligible for rewards array
    /// @param addrToRemoveMultiplier Address to remove multiplier
    function _removeEligibilityMultiplier(address addrToRemoveMultiplier)
        private
    {
        // Pops off address from element shift to reduce reward multiplier
        if (addressesEligibleForRewards.length == 1)
            addressesEligibleForRewards.pop();
        else if (addressesEligibleForRewards.length > 1) {
            for (
                uint256 i = 0;
                i < addressesEligibleForRewards.length - 1;
                i++
            ) {
                if (addressesEligibleForRewards[i] == addrToRemoveMultiplier) {
                    addressesEligibleForRewards[
                        i
                    ] = addressesEligibleForRewards[i + 1];
                    addressesEligibleForRewards.pop();
                }
            }
        }
    }

    /** @notice Returns an array of addresses eligible for reward 
    as well as the number of addresses eligible for the reward.
    */
    function getEligibleRewardWinners()
        public
        view
        returns (address[] memory, uint256)
    {
        return (
            addressesEligibleForRewards,
            addressesEligibleForRewards.length
        );
    }
}
