import { useContext } from 'react';
import { AppContext } from './Context';
import Button from './Button';
import '../styles/marketplace.css';

const Card = ({
  packName,
  packImg,
  packPrice,
  packListingId,
  nftIds,
  packSeller,
}) => {
  const [activePack, setActivePack] = useContext(AppContext);
  const displayActivePack = () => {
    setActivePack({
      packName,
      packImg,
      packPrice,
      packListingId,
      nftIds,
      packSeller,
      nftIds,
    });
  };

  return (
    <>
      <div className="nft-pack-container">
        {packImg ? (
          <img
            src={packImg}
            className="nft-pack-img"
            height="210"
            width="256"
          ></img>
        ) : (
          <img
            height="210px"
            width="256px"
            style={{ visibility: 'hidden' }}
          ></img>
        )}
        <div className="below-img">
          <div className="nft-title-info">
            <span className="info-text">Name: {packName}</span>
            <span className="info-text">Price: {packPrice} Matic</span>
            <span className="info-text">Ids: {nftIds}</span>
          </div>
          <div className="pack-btn">
            <Button btnName="Details" onClick={() => displayActivePack()} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
