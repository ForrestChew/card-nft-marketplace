// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title An NFT marketplace for NFTs created from designated ERC721 smart contract.
/// @author https://twitter.com/BossMcBara
/// @notice To be used in tandem with a certain ERC721 marketplace
/// @dev Anytime the word "pack" is used, it's to describe a pack of NFTs
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
    mapping(address => PackListing[]) public listingsSeller;
    event NewPackListing(
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
    /// @dev The marketplace will take ownership of the NFTs until the pack is either sold, or delisted
    function listPack(uint256 _packPrice, uint256[] memory _nftIds) public {
        for (uint256 i = 0; i < _nftIds.length; i++) {
            IERC721(nftCardFactory).transferFrom(
                msg.sender,
                address(this),
                _nftIds[i]
            );
        }
        uint256 packListingId = listingsSeller[msg.sender].length + 1;
        listingsSeller[msg.sender].push(
            PackListing({
                packListingId: packListingId,
                packPrice: _packPrice,
                packSeller: msg.sender,
                nftIds: _nftIds
            })
        );
        emit NewPackListing(packListingId, _packPrice, msg.sender, _nftIds);
    }

    /// @notice Delists an owned NFT pack listing
    /// @param _packId The ID of the owned NFT pack the caller wants to delist
    function delistPack(uint256 _packId) public {
        uint256 packListingIdx;
        bool packIdExists;
        for (uint256 i = 0; i < listingsSeller[msg.sender].length; i++) {
            if (listingsSeller[msg.sender][i].packListingId == _packId) {
                packListingIdx = i;
                packIdExists = true;
            }
        }
        if (packIdExists) {
            // Shifts elements to the right from _packId's index and pops off the last element
            for (
                uint256 i = packListingIdx;
                i < listingsSeller[msg.sender].length - 1;
                i++
            ) {
                listingsSeller[msg.sender][i] = listingsSeller[msg.sender][
                    i + 1
                ];
            }
            listingsSeller[msg.sender].pop();
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
        for (uint256 i = 0; i < listingsSeller[_listingSeller].length; i++) {
            if (listingsSeller[_listingSeller][i].packListingId == _packId) {
                uint256 threePercentTax = ((listingsSeller[_listingSeller][i]
                    .packPrice * 500) / 10000);
                require(
                    msg.value ==
                        listingsSeller[_listingSeller][i].packPrice +
                            threePercentTax,
                    "buyNftPack: Wrong amount"
                );
                // Loops through pack listing NFT id array, and tranfers them to pack buyer
                for (
                    uint256 j = 0;
                    j < listingsSeller[_listingSeller][i].nftIds.length;
                    j++
                ) {
                    IERC721(nftCardFactory).transferFrom(
                        address(this),
                        msg.sender,
                        listingsSeller[_listingSeller][i].nftIds[j]
                    );
                }
                (bool txFee, ) = _listingSeller.call{value: threePercentTax}(
                    ""
                );
                require(txFee, "txFee: Tx failed");
                (bool txSeller, ) = _listingSeller.call{
                    value: listingsSeller[_listingSeller][i].packPrice
                }("");
                require(txSeller, "sellerTx: Tx failed");
                delete listingsSeller[_listingSeller];
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
        return listingsSeller[_listingSeller];
    }
}
