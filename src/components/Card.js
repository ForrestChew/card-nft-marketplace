import { useContext, useEffect } from 'react';
import { AppContext } from './Context';
import Button from './Button';
import '../styles/marketplace.css';

const Card = ({
  packImg,
  packPrice,
  packListingId,
  nftCount,
  packSeller,
  nftIds,
}) => {
  const [activePack, setActivePack] = useContext(AppContext);
  const displayActivePack = () => {
    setActivePack({
      packImg,
      packPrice,
      packListingId,
      nftCount,
      packSeller,
      nftIds,
    });
  };

  return (
    <>
      <div className="nft-pack-container">
        <img
          src={packImg}
          className="nft-pack-img"
          height="210"
          width="256"
        ></img>
        <div className="below-img">
          <div className="nft-title-info">
            <span className="info-text">Name</span>
            <span className="info-text">Count: {nftCount}</span>
            <span className="info-text">Price: {packPrice}</span>
          </div>
          <div className="pack-btn">
            <Button
              btnName="Details"
              packImg={packImg}
              packPrice={packPrice}
              packListingId={packListingId}
              nftCount={nftCount}
              packSeller={packSeller}
              nftIds={nftIds}
              onClick={() => displayActivePack()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
