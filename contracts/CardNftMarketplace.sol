// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title An NFT marketplace for NFTs created from designated ERC721 smart contract.
/// @author https://twitter.com/BossMcBara
/// @notice To be used in tandem with a certain ERC721 marketplace
/// @dev Anytime the word "pack" is used, it's to describe a pack of NFTs.
/// @dev WARNING: Most write functions are incredibly gas intensive and therefore expensive.
contract CardNftMarketplace is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public packListingCount;
    address public immutable nftCardFactory;
    address public immutable marketplaceOwner;

    struct PackListing {
        uint256 packListingId;
        uint256 packPrice;
        address packSeller;
        uint256[] nftIds;
    }
    // Address --> array of pack listings
    mapping(address => PackListing[]) public s_listingsSeller;

    event NewPackListing(
        string name,
        uint256 packListingId,
        uint256 packPrice,
        address packSeller,
        uint256[] nftIds
    );
    event PackDelisted(uint256 packListingId);
    event ListingSold(
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    /// @notice Sets inital global varibales
    /// @param _marketplaceOwner addresss will be set as marketplace owner
    /** @param _nftCardsAddr will be the deployed ERC721 cards address. This is
    needed in order to execute functions steming from the ERC721 smart contract.
    */
    constructor(address _marketplaceOwner, address _nftCardsAddr) {
        marketplaceOwner = _marketplaceOwner;
        nftCardFactory = _nftCardsAddr;
    }

    /// @notice List 1 - 5 amount of NFTs together as a pack to be sold
    /// @param _packPrice the price the function caller would like to sell the pack for
    /// @param _nftIds the ID's of the NFT(s) the function caller would like to bundle in pack to sell
    /// @param _packName User given name
    /// @dev The marketplace will take ownership of the NFTs until the pack is either sold, or delisted
    function listPack(
        uint256 _packPrice,
        uint256[] memory _nftIds,
        string memory _packName
    ) public {
        for (uint256 i = 0; i < _nftIds.length; i++) {
            IERC721(nftCardFactory).transferFrom(
                msg.sender,
                address(this),
                _nftIds[i]
            );
        }
        uint256 packListingId = s_listingsSeller[msg.sender].length + 1;
        s_listingsSeller[msg.sender].push(
            PackListing({
                packListingId: packListingId,
                packPrice: _packPrice,
                packSeller: msg.sender,
                nftIds: _nftIds
            })
        );
        emit NewPackListing(
            _packName,
            packListingId,
            _packPrice,
            msg.sender,
            _nftIds
        );
    }

    /// @notice Delists an owned NFT pack listing
    /// @param _packId The ID of the owned NFT pack the caller wants to delist
    function delistPack(uint256 _packId) public {
        uint256 packListingIdx;
        bool packIdExists;
        // Transfers NFTs in pack back into the listers wallet
        for (uint256 i = 0; i < s_listingsSeller[msg.sender].length; i++) {
            if (s_listingsSeller[msg.sender][i].packListingId == _packId) {
                packListingIdx = i;
                packIdExists = true;
                for (
                    uint256 j = 0;
                    j < s_listingsSeller[msg.sender][i].nftIds.length;
                    j++
                ) {
                    IERC721(nftCardFactory).transferFrom(
                        address(this),
                        msg.sender,
                        s_listingsSeller[msg.sender][i].nftIds[j]
                    );
                }
            }
        }
        if (packIdExists) {
            // Shifts elements to the right from _packId's index and pops off the last element
            for (
                uint256 i = packListingIdx;
                i < s_listingsSeller[msg.sender].length - 1;
                i++
            ) {
                s_listingsSeller[msg.sender][i] = s_listingsSeller[msg.sender][
                    i + 1
                ];
            }
            s_listingsSeller[msg.sender].pop();
            emit PackDelisted(_packId);
        } else revert("delistPack: Non-existant pack ID");
    }

    /// @notice Buys the NFT pack if the correct amount of ether is provided
    /// @param _packId The ID of the NFT pack the caller wants to buy
    /// @param _listingSeller The address of the NFT pack seller
    function buyNftPack(uint256 _packId, address _listingSeller)
        public
        payable
    {
        // Loops through packs owned by @param _listingSeller and checks
        // whether there is a matching pack id to the @param _packId
        for (uint256 i = 0; i < s_listingsSeller[_listingSeller].length; i++) {
            if (s_listingsSeller[_listingSeller][i].packListingId == _packId) {
                uint256 threePercentTax = ((s_listingsSeller[_listingSeller][i]
                    .packPrice * 500) / 10000);
                require(
                    msg.value == s_listingsSeller[_listingSeller][i].packPrice,
                    "buyNftPack: Wrong amount"
                );
                // Loops through pack listing NFT id array, and tranfers them to pack buyer
                for (
                    uint256 j = 0;
                    j < s_listingsSeller[_listingSeller][i].nftIds.length;
                    j++
                ) {
                    IERC721(nftCardFactory).transferFrom(
                        address(this),
                        msg.sender,
                        s_listingsSeller[_listingSeller][i].nftIds[j]
                    );
                }
                (bool txFee, ) = _listingSeller.call{value: threePercentTax}(
                    ""
                );
                require(txFee, "txFee: Tx failed");
                (bool txSeller, ) = _listingSeller.call{
                    value: s_listingsSeller[_listingSeller][i].packPrice -
                        threePercentTax
                }("");
                require(txSeller, "sellerTx: Tx failed");
                delete s_listingsSeller[_listingSeller][i];
                emit ListingSold(_listingSeller, msg.sender, msg.value);
            } else {
                revert("buyNftPack: Pack does not exist");
            }
        }
    }

    /// @notice Retrieves listing struct
    /// @param _listingSeller The address you wish to get the listings of
    /// @return Array of listings mapped to a given address
    function getListingsByAddress(address _listingSeller)
        public
        view
        returns (PackListing[] memory)
    {
        return s_listingsSeller[_listingSeller];
    }
}
