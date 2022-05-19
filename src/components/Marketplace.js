import { useState, useEffect } from 'react';
import { useMoralisQuery } from 'react-moralis';
import { Moralis } from 'moralis';
import { getCardFactoryInstance } from './ComponentUtils';
import IsLoading from './IsLoading';
import Card from './Card';
import ActionInfoSection from './ActionInfoSection';
import '../styles/cards.css';

const Marketplace = () => {
  const packImg =
    'https://imgs.search.brave.com/6ZRXjdjAX4Nn79yp-klSMBB6kDisZdnk5B-kkKTHrjE/rs:fit:695:225:1/g:ce/aHR0cHM6Ly90c2Uy/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC4y/QnEzMUIwMjFkUHA3/S1FLdWVaaDVBSGFG/RCZwaWQ9QXBp';
  const [nftPackListings, setNftPackListings] = useState([]);
  const { data, isLoading } = useMoralisQuery('NewPackListing');

  useEffect(() => {
    try {
      setNftPackListings(data);
    } catch (error) {
      alert('Could not load packs. Please refresh page');
    }
  }, [data]);
  console.log(data);
  return (
    <>
      {isLoading ? (
        <IsLoading />
      ) : (
        <div className="marketplace-components">
          <div className="nft-packs-container">
            {nftPackListings.map((nftPackListing, index) => {
              const { packListingId, packPrice } = nftPackListing.attributes;
              console.log(packListingId);
              return (
                <Card
                  key={index}
                  packImg={packImg}
                  nftPackListingId={packListingId}
                  packPrice={Moralis.Units.FromWei(packPrice)}
                />
              );
            })}
          </div>
          <div className="action-info-section">
            <ActionInfoSection packImg={packImg} />
          </div>
        </div>
      )}
    </>
  );
};

export default Marketplace;
