import { useState, useEffect, useContext } from 'react';
import { useMoralisQuery } from 'react-moralis';
import { Moralis } from 'moralis';
import { AppContext } from './Context';
import IsLoading from './IsLoading';
import NoPackSelected from './NoPackSelected';
import Card from './Card';
import ActionInfoSection from './ActionInfoSection';
import '../styles/cards.css';

const Marketplace = () => {
  const packImg =
    'https://imgs.search.brave.com/6ZRXjdjAX4Nn79yp-klSMBB6kDisZdnk5B-kkKTHrjE/rs:fit:695:225:1/g:ce/aHR0cHM6Ly90c2Uy/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC4y/QnEzMUIwMjFkUHA3/S1FLdWVaaDVBSGFG/RCZwaWQ9QXBp';
  const [nftPackListings, setNftPackListings] = useState([]);
  const [activePack, setActivePack] = useContext(AppContext);
  const { data, isLoading } = useMoralisQuery('NewPackListing');

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
              const { packListingId, packPrice, packSeller, nftIds } =
                nftPackListing.attributes;
              return (
                <Card
                  key={index}
                  packImg={packImg}
                  packPrice={Moralis.Units.FromWei(packPrice)}
                  packListingId={packListingId}
                  nftCount={nftIds.length}
                  packSeller={packSeller}
                  nftIds={nftIds}
                />
              );
            })}
          </div>
          <div className="action-info-section">
            {/* Checks whether there is a pack selected by checking
            if a pack id exists within the global context */}
            {activePack.packListingId ? (
              <ActionInfoSection
                // packName={packName}
                packImg={packImg}
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
