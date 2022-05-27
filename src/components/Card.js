import { useContext } from 'react';
import { AppContext } from './Context';
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
  // Sets the active NFT within the global context
  const displayActivePack = () => {
    setActivePack({
      packName,
      packImg,
      packPrice,
      packListingId,
      nftIds,
      packSeller,
    });
  };

  return (
    <>
      <div className="nft-pack-container">
        {packImg ? (
          <img
            src={packImg}
            className="nft-pack-img"
            height="196"
            width="256"
          ></img>
        ) : (
          <img
            height="196px"
            width="256px"
            style={{ visibility: 'hidden' }}
          ></img>
        )}
        <div className="below-img">
          <div className="nft-title-info">
            <span className="info-text">{packName}</span>
            <span className="info-text">{packPrice} Matic</span>
            <span className="info-text">{packListingId}</span>
            <span className="info-text">{`NFT IDs: ${nftIds}`}</span>
          </div>
          <div className="pack-btn">
            <button className="btn-global" onClick={displayActivePack}>
              Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
