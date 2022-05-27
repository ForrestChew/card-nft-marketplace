import { useState, useEffect, useRef, useContext } from 'react';
import { useMoralis } from 'react-moralis';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import { factoryAddress, factoryAbi } from '../contract-info/factory-info';
import { AppContext } from './Context';
import { NFT } from 'web3uikit';
import IsLoading from './IsLoading';
import ActionInfoSection from './ActionInfoSection';
import Card from './Card';
import SimpleForm from './SimpleForm';
import '../styles/marketplace.css';
import '../styles/profile.css';

const Profile = (userAddress) => {
  const [isLoadingNfts, setIsLoadingNfts] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [packId, setPackId] = useState(0);
  const [nftSetId, setNftSetId] = useState(0);
  const [nftId, setNftId] = useState(0);
  const [nftRarity, setNftRarity] = useState('...');
  const [amountOfNftsPerSet, setAmountOfNftsPerSet] = useState(0);
  const [userNftPackListings, setUserNftPackListings] = useState([]);
  const [userOwnedNftsIds, setUserOwnedNftsIds] = useState([]);
  const [eligibleWinners, setEligibleWinners] = useState([]);
  // The user input address the user wants to see pack listings from
  const [listingsOwner, setListingsOwner] = useState('');
  const [listingIds, setListingIds] = useState([]);
  const [activePack] = useContext(AppContext);
  const hasFetchedData = useRef(false);

  // Used to stop infinite loop in useEffect
  // const hasFetchedData = useRef(false);
  const { Moralis } = useMoralis();

  // Exists so that navigating back to the profile page
  // will always render user listed packs
  useEffect(() => {
    hasFetchedData.current = false;
  }, []);

  // Gets and displays user owned NFTs that come from the card factory address
  useEffect(() => {
    const getUserNfts = async () => {
      try {
        const userNfts = await Moralis.Web3API.account.getNFTsForContract({
          chain: 'mumbai',
          token_address: factoryAddress,
        });
        userNfts.result.forEach((nftId) => {
          setUserOwnedNftsIds((userOwnedNftsIds) => [
            ...userOwnedNftsIds,
            nftId.token_id,
          ]);
        });
        setIsLoadingNfts(false);
      } catch (e) {
        console.log(e);
      }
    };
    if (!hasFetchedData.current) getUserNfts();
  }, []);

  // Gets and displays pack listings owned by user
  useEffect(() => {
    const getUserPacks = async () => {
      try {
        const PackListings = Moralis.Object.extend('NewPackListing');
        const query = new Moralis.Query(PackListings);
        query.equalTo('packSeller', userAddress.userAddress);
        const queryFound = query.find();
        setUserNftPackListings(await queryFound);
        hasFetchedData.current = true;
        setIsLoadingPacks(false);
      } catch (e) {
        console.log(e);
      }
    };
    if (!hasFetchedData.current) getUserPacks();
  });

  // Returns an instance of Factory smart contract to caller
  const getContractFactoryInstance = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardFactory = new ethers.Contract(factoryAddress, factoryAbi, signer);
    return cardFactory;
  };

  // Returns an instance of Marketplace smart contract to caller
  const getContractMarketplaceInstance = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    return cardMarketplace;
  };

  // Queries the factory smart contract and sets the amount
  // of NFTs that a user owns in an NFT set to be displayed.
  const getNftsInSet = async (e) => {
    e.preventDefault();
    const cardFactory = await getContractFactoryInstance();
    await cardFactory
      .s_numOfNftsOwnedPerPack(nftSetId, userAddress.userAddress)
      .then((result) => {
        setAmountOfNftsPerSet(result);
      });
  };

  // Delists a user's NFT pack by it's ID. Some NFT packs within the
  // marketplace will have the same ID, but this is a non-issue as
  // the function will check for ownership based on the current address.
  const delistPack = async (e) => {
    e.preventDefault();
    const cardMarketplace = await getContractMarketplaceInstance();
    await cardMarketplace.delistPack(packId).then(() => {
      removeDatabaseEntry();
    });
  };

  // Removes the pack listing from database when the delist function is called
  const removeDatabaseEntry = async () => {
    const PackListings = Moralis.Object.extend('NewPackListing');
    const query = new Moralis.Query(PackListings);
    query.equalTo('packListingId', packId);
    query.equalTo('packSeller', userAddress.userAddress);
    const queryFound = await query.find();
    await queryFound[0].destroy().then(
      () => {
        console.log('Deleted');
      },
      (error) => {
        console.log(error);
      }
    );
  };

  // Queries the factory smart contract to set and display an
  // NFTs rarity based on it's token ID.
  const getNftRarity = async (e) => {
    e.preventDefault();
    const cardFactory = await getContractFactoryInstance();
    await cardFactory.s_nftRarity(nftId).then((result) => {
      setNftRarity(result);
    });
  };

  // Verifies that a user has a full NFT set
  const verifyFullSet = async (e) => {
    e.preventDefault();
    const cardFactory = await getContractFactoryInstance();
    await cardFactory.verifyCompletePackOwnerShip(nftSetId);
  };

  // Returns addresses that are eligible for rewards
  const getEligibleWinners = async (e) => {
    e.preventDefault();
    const cardFactory = await getContractFactoryInstance();
    const response = await cardFactory.getEligibleRewardWinners();
    const winners = response[0];
    winners.forEach((winner) => {
      setEligibleWinners((eligibleWinners) => [...eligibleWinners, winner]);
    });
  };

  // Returns pack listings of an input address
  const getPackListings = async (e) => {
    e.preventDefault();
    setListingIds([]);
    const cardMarketplace = await getContractMarketplaceInstance();
    const listings = await cardMarketplace.getListingsByAddress(listingsOwner);
    listings.forEach((listing) => {
      setListingIds((listingsIds) => [
        ...listingsIds,
        parseInt(listing.packListingId),
      ]);
    });
  };

  const listingByAddressChange = (e) => {
    setListingsOwner(e.target.value);
  };

  const nftIdChange = (e) => {
    setNftId(e.target.value);
  };

  const setIdChange = (e) => {
    setNftSetId(e.target.value);
  };

  const packIdChange = (e) => {
    setPackId(e.target.value);
  };

  return (
    <>
      {isLoadingNfts || isLoadingPacks ? (
        <IsLoading />
      ) : (
        <>
          <div className="forms-container">
            <SimpleForm
              labelTitle="Delist NFT Pack"
              placeholder="Pack ID"
              onChangeFc={packIdChange}
              onClickFc={delistPack}
              btnTitle="Delist"
              fetchedData="..."
            />
            <SimpleForm
              labelTitle="NFTs Owned in Set"
              placeholder="Set ID"
              onChangeFc={setIdChange}
              onClickFc={getNftsInSet}
              btnTitle="Check"
              fetchedData={`ID ${nftSetId}: Amount ${parseInt(
                amountOfNftsPerSet
              )}`}
            />
            <SimpleForm
              labelTitle="Check NFT Rarity"
              placeholder="NFT ID"
              onChangeFc={nftIdChange}
              onClickFc={getNftRarity}
              btnTitle="Check Rarity"
              fetchedData={nftRarity}
            />
            <SimpleForm
              labelTitle="Set ID to Verify"
              placeholder="Set ID"
              onChangeFc={setIdChange}
              onClickFc={verifyFullSet}
              btnTitle="Verify"
              fetchedData="..."
            />
            <div
              className="forms info-box"
              style={{ borderBottomRightRadius: '0' }}
            >
              <form>
                <label>Address</label>
                <input
                  className="input-box"
                  type="text"
                  placeholder="Address"
                  min="1"
                  onChange={listingByAddressChange}
                />
                <button className="btn-global" onClick={getPackListings}>
                  Get Listings
                </button>
                <span style={{ marginTop: '.5rem' }}>
                  Listing IDs: {listingIds.join(', ')}
                </span>
              </form>
            </div>
            <div
              className="forms info-box"
              style={{ borderBottomRightRadius: '0' }}
            >
              <p>Get Eligible Winners</p>
              <button className="btn-global" onClick={getEligibleWinners}>
                Get
              </button>
              <div className="content">
                {eligibleWinners.map((winner, index) => {
                  return <p key={index}>{winner}</p>;
                })}
              </div>
            </div>
          </div>
          <div className="packs-container">
            <div
              className="action-info-section"
              style={{ top: '16rem', margin: '1.5rem 0 0 1rem' }}
            >
              {/* Checks whether there is a pack selected by checking
                if a name exists within the global context */}
              {activePack.packName ? (
                <ActionInfoSection
                  packName={activePack.packName}
                  packPrice={activePack.packPrice}
                  packListingId={activePack.packListingId}
                  nftCount={activePack.nftIds.length}
                  packSeller={activePack.packSeller}
                  nftIds={activePack.nftIds}
                />
              ) : (
                <div className="no-pack-selected">
                  <h1>No Pack Selected</h1>
                </div>
              )}
            </div>
            <div className="user-packs">
              {userNftPackListings.map((nftPackListing, index) => {
                const {
                  name,
                  packImage,
                  packListingId,
                  packPrice,
                  packSeller,
                  nftIds,
                } = nftPackListing.attributes;
                let packImgUrl;
                try {
                  packImgUrl = packImage._url;
                } catch (error) {}
                return (
                  <Card
                    key={index}
                    packName={`Name: ${name}`}
                    packImg={packImgUrl}
                    packPrice={`Price: ${Moralis.Units.FromWei(packPrice)}`}
                    packListingId={`Pack ID: ${packListingId}`}
                    packSeller={packSeller}
                    nftIds={nftIds.join(', ')}
                  />
                );
              })}
            </div>
            <div className="user-nfts">
              {userOwnedNftsIds.map((nftId, index) => {
                return (
                  <NFT
                    key={index}
                    address={userAddress.userAddress}
                    tokenId={nftId}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
