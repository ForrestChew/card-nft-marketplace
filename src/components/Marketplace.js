import { useState, useEffect, useContext } from 'react';
import { useMoralisQuery } from 'react-moralis';
import { Moralis } from 'moralis';
import { AppContext } from './Context';
import IsLoading from './IsLoading';
import NoPackSelected from './NoPackSelected';
import Card from './Card';
import ActionInfoSection from './ActionInfoSection';
import '../styles/marketplace.css';

const Marketplace = () => {
  const [nftPackListings, setNftPackListings] = useState([]);
  const [activePack] = useContext(AppContext);

  const { data, isLoading } = useMoralisQuery('NewPackListings');

  useEffect(() => {
    try {
      setNftPackListings(data);
    } catch (error) {
      alert('Could not load packs. Please refresh page');
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <IsLoading />
      ) : (
        <div className="marketplace-components">
          <div className="nft-packs-container">
            {nftPackListings.map((nftPackListing, index) => {
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
                  packPrice={`Price: ${Moralis.Units.FromWei(packPrice)}`}
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
            <Card />
            <Card />
          </div>
          <div className="action-info-section">
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
              <NoPackSelected />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Marketplace;
