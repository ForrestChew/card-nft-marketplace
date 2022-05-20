import { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { NFT } from 'web3uikit';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import { factoryAddress } from '../contract-info/factory-info';
import '../styles/marketplace.css';
import '../styles/action-info-section.css';
import '../styles/main.css';

const ActionInfoSection = ({
  packName,
  packImg,
  packPrice,
  packListingId,
  nftCount,
  packSeller,
  nftIds,
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const { Moralis } = useMoralis();

  const buyPack = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    await cardMarketplace.buyNftPack(packListingId, packSeller, {
      value: Moralis.Units.ETH('1'),
    });
  };

  const nextImg = () => {
    setCurrentImgIdx(
      currentImgIdx === nftIds.length - 1 ? 0 : currentImgIdx + 1
    );
  };
  const prevImg = () => {
    setCurrentImgIdx(
      currentImgIdx === 0 ? nftIds.length - 1 : currentImgIdx - 1
    );
  };

  return (
    <>
      <div className="info-section-container action-info-sec">
        <div className="pack-info">
          {/* <span>{packName}</span> */}
          <span>Pack Id: {packListingId}</span>
          <span>Price: {packPrice} Matic</span>
          <span>NFT Count: {nftCount}</span>
          <span>Seller: {packSeller}</span>
        </div>
        <div className="carousel-container">
          <div className="arrows">
            <FaArrowLeft className="prev-arrow" onClick={() => prevImg()} />
            <FaArrowRight className="next-arrow" onClick={() => nextImg()} />
          </div>
          {console.log(nftIds)}
          {console.log(nftIds[currentImgIdx])}
          <NFT
            address={factoryAddress}
            chain="mumbai"
            tokenId={nftIds[currentImgIdx]}
            fetchMetadata="true"
            className="nft-img"
          />
        </div>
        <div className="footer">
          <button className="buy-btn" onClick={() => buyPack()}>
            Buy Pack
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionInfoSection;
