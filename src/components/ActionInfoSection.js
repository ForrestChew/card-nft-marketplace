import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { NFT } from 'web3uikit';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import { factoryAddress, factoryAbi } from '../contract-info/factory-info';
import '../styles/marketplace.css';
import '../styles/action-info-section.css';
import '../styles/main.css';

const ActionInfoSection = ({
  packName,
  packPrice,
  packListingId,
  packSeller,
  nftIds,
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [nftRarity, setNftRarity] = useState('');
  const [nftSetId, setNftSetId] = useState(0);

  const nftIdsIsolation = nftIds.split(' ')[currentImgIdx].replace(',', '');
  console.log(nftIdsIsolation);

  const { Moralis } = useMoralis();

  useEffect(() => {
    const getNftRarity = async () => {
      const provider = Moralis.web3;
      const ethers = Moralis.web3Library;
      // As this fc calls a read only method in smart contract,
      // only a provider is passed as a param. Signer not needed.
      const cardFactory = new ethers.Contract(
        factoryAddress,
        factoryAbi,
        provider
      );
      setNftRarity(await cardFactory.nftRarity(nftIdsIsolation[currentImgIdx]));
    };
    getNftRarity();
  }, [currentImgIdx]);

  useEffect(() => {
    const getNftSetId = async () => {
      const provider = Moralis.web3;
      const ethers = Moralis.web3Library;
      const cardFactory = new ethers.Contract(
        factoryAddress,
        factoryAbi,
        provider
      );
      setNftSetId(
        await cardFactory.nftIdToPackId(nftIdsIsolation[currentImgIdx])
      );
    };
    getNftSetId();
  }, [currentImgIdx]);

  const deleteMoralisTable = async () => {
    const PackListings = Moralis.Object.extend('NewPackListings');
    const query = new Moralis.Query(PackListings);
    query.equalTo('packListingId', packListingId);
    query.equalTo('name', packName);
    const queryFound = await query.find();
    console.log(queryFound);
    await queryFound[0].destroy().then(
      () => {
        console.log('Deleted');
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const buyPack = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    await cardMarketplace
      .buyNftPack(packListingId, packSeller, {
        value: Moralis.Units.ETH(packPrice),
        gasLimit: 1000000,
      })
      .then(() => {
        deleteMoralisTable();
      });
  };

  // Rotates to the next image in NFT carousel
  const nextImg = () => {
    setCurrentImgIdx(
      currentImgIdx === nftIdsIsolation.length - 1 ? 0 : currentImgIdx + 1
    );
  };
  // Rotates to the previous image in NFT carousel
  const prevImg = () => {
    setCurrentImgIdx(
      currentImgIdx === 0 ? nftIdsIsolation.length - 1 : currentImgIdx - 1
    );
  };

  return (
    <>
      <div className="info-section-container action-info-sec">
        <div className="pack-info">
          <span>Pack Name: {packName}</span>
          <span>Price: {packPrice} Matic</span>
          <span>Seller: {packSeller}</span>
        </div>
        <div className="carousel-container">
          <div className="arrows">
            <FaArrowLeft className="prev-arrow" onClick={() => prevImg()} />
            <FaArrowRight className="next-arrow" onClick={() => nextImg()} />
          </div>
          <div className="nft-info-container">
            <span>NFT ID: {nftIdsIsolation}</span>
            <span>NFT Set ID: {parseInt(nftSetId)}</span>
            <span>NFT Rarity: {nftRarity}</span>
          </div>
          <NFT
            address={factoryAddress}
            chain="mumbai"
            tokenId={nftIdsIsolation}
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
