import Button from './Button';
import '../styles/cards.css';

const Card = ({ packImg, nftPackListingId, packPrice, nftCount }) => {
  return (
    <>
      <div className="nft-pack-container">
        <img
          src={packImg}
          className="nft-pack-img"
          height="210"
          width="256"
        ></img>
        <div className="nft-title-info">
          <p>Dipshits</p>
          <p>Item Count:</p>
          <p>Price: {packPrice} </p>
          <p>Id: {nftPackListingId}</p>
        </div>
        <div className="pack-btn">
          <Button btnName="Buy" />
        </div>
      </div>
    </>
  );
};

export default Card;
