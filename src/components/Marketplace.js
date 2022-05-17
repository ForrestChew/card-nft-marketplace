import Card from './Card';
import ActionInfoSection from './ActionInfoSection';
import '../styles/cards.css';

const Marketplace = () => {
  const packImg =
    'https://imgs.search.brave.com/mcwnWR2bgfV8YNVaO92L6QaZer57E4lEKdWuDlwDVZs/rs:fit:600:500:1/g:ce/aHR0cHM6Ly9kM2xw/NHhlZGJxYThhNS5j/bG91ZGZyb250Lm5l/dC9zMy9kaWdpdGFs/LWNvdWdhci1hc3Nl/dHMvbm93LzIwMTcv/MTIvMjAvMTUxMzcy/OTQ5MzQxM19Eb25h/bGR0cnVtcHJvYm90/LmpwZz93aWR0aD02/OTAmaGVpZ2h0PSZt/b2RlPWNyb3AmcXVh/bGl0eT03NQ';
  return (
    <>
      <div className='marketplace-components'>
        <div className='nft-packs-container'>
          <Card packImg={packImg} />
          <Card packImg={packImg} />
          <Card packImg={packImg} />
          <Card packImg={packImg} />
          <Card packImg={packImg} />
        </div>
        <div className='action-info-section'>
          <ActionInfoSection packImg={packImg} />
        </div>
      </div>
    </>
  );
};

export default Marketplace;
