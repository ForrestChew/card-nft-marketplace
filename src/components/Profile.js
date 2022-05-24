import { useState, useEffect, useRef, useContext } from 'react';
import { useMoralis } from 'react-moralis';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import { factoryAddress, factoryAbi } from '../contract-info/factory-info';
import { AppContext } from './Context';
import ActionInfoSection from './ActionInfoSection';
import NoPackSelected from './NoPackSelected';
import Card from './Card';
import '../styles/marketplace.css';
import '../styles/profile.css';

const Profile = (userAddress) => {
  const [packId, setPackId] = useState(0);
  const [userNftPackListings, setUserNftPackListings] = useState([]);
  const [activePack, setActivePack] = useContext(AppContext);

  // Used to stop infinite loop in useEffect
  const hasFetchedData = useRef(false);
  const { Moralis } = useMoralis();

  // Exists so that navigating back to the profile page
  // will always render user listed packs
  useEffect(() => {
    hasFetchedData.current = false;
  }, []);

  useEffect(() => {
    const getUserPacks = async () => {
      try {
        const PackListings = Moralis.Object.extend('NewPackListings');
        const query = new Moralis.Query(PackListings);
        query.equalTo('packSeller', userAddress.userAddress);
        const queryFound = query.find();
        setUserNftPackListings(await queryFound);
        hasFetchedData.current = true;
      } catch (e) {
        console.log(e);
      }
    };
    if (!hasFetchedData.current) getUserPacks();
  });

  const delistPack = async (e) => {
    e.preventDefault();
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    await cardMarketplace.delistPack(packId).then(() => {
      removeDatabaseEntry();
    });
  };

  const removeDatabaseEntry = async () => {
    const PackListings = Moralis.Object.extend('NewPackListings');
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

  const packIdChange = (e) => {
    setPackId(e.target.value);
  };

  return (
    <>
      <div className="profile-container">
        <div className="packs">
          <form className="user-pack-form">
            <label>Delist NFT pack</label>
            <input
              className="input-box"
              type="number"
              placeholder="Pack ID"
              min="1"
              onChange={packIdChange}
            />
            <button className="btn-global" onClick={delistPack}>
              Delist
            </button>
          </form>
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
              } catch (error) {
                console.log(error);
              }
              return (
                <Card
                  key={index}
                  packName={`Name: ${name}`}
                  packImg={packImgUrl}
                  packPrice={`Bought For: ${Moralis.Units.FromWei(packPrice)}`}
                  packListingId={`Pack ID: ${packListingId}`}
                  packSeller={packSeller}
                  nftIds={nftIds.join(', ')}
                />
              );
            })}
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
          </div>
        </div>
        <div className="action-info-section">
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
            <NoPackSelected />
          )}
        </div>
        <div className="set-check">
          <form className="user-pack-form">
            <label>How many NFTs owned in set</label>
            <input type="number" min="1" placeholder="ID to check" />
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
