import '../styles/cards.css';

const Card = ({ packImg }) => {
  return (
    <>
      <div className='nft-pack-container'>
        <img
          src={packImg}
          className='nft-pack-img'
          height='210'
          width='256'
        ></img>
        <div className='nft-title-info'>
          <p>Dipshits</p>
          <p>Id: 1</p>
        </div>
      </div>
    </>
  );
};

export default Card;
