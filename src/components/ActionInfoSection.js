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
  const nftIdsArr = nftIds.split(' ');
  const nftIdsIsolation = nftIdsArr[currentImgIdx].replace(',', '').trim();
  const { Moralis } = useMoralis();

  // Returns an instance of Factory smart contract to caller
  const getContractFactoryInstance = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardFactory = new ethers.Contract(factoryAddress, factoryAbi, signer);
    return cardFactory;
  };

  // Gets Marketplace smart contract instance
  const getContractMarketplaceInstance = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    return cardMarketplace;
  };

  // Gets and displays rarity of the active NFT in carousel
  useEffect(() => {
    const getNftRarity = async () => {
      const cardFactory = await getContractFactoryInstance();
      setNftRarity(await cardFactory.s_nftRarity(nftIdsIsolation));
    };
    getNftRarity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImgIdx]);

  // Gets and displays the set ID to which the active NFT in carousel belongs
  useEffect(() => {
    const getNftSetId = async () => {
      const cardFactory = await getContractFactoryInstance();
      setNftSetId(await cardFactory.s_nftIdToPackId(nftIdsIsolation));
    };
    getNftSetId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImgIdx]);

  // Removes pack listing entry from database when a pack is bought
  const removeDatabaseEntry = async () => {
    const PackListings = Moralis.Object.extend('NewPackListing');
    const query = new Moralis.Query(PackListings);
    query.equalTo('packListingId', packListingId);
    query.equalTo('name', packName);
    const queryFound = await query.find();
    await queryFound[0].destroy().then(
      () => {
        console.log('Deleted');
      },
      (error) => {
        console.log(error);
      }
    );
  };

  // Interacts with Marketplace smart contract to buy pack
  const buyPack = async () => {
    const cardMarketplace = await getContractMarketplaceInstance();
    await cardMarketplace
      .buyNftPack(packListingId, packSeller, {
        value: Moralis.Units.ETH(packPrice),
        gasLimit: 1000000,
      })
      .then(() => {
        removeDatabaseEntry();
      });
  };

  // Rotates to the next image in NFT carousel
  const nextImg = () => {
    setCurrentImgIdx(
      currentImgIdx === nftIdsArr.length - 1 ? 0 : currentImgIdx + 1
    );
  };
  // Rotates to the previous image in NFT carousel
  const prevImg = () => {
    setCurrentImgIdx(
      currentImgIdx === 0 ? nftIdsArr.length - 1 : currentImgIdx - 1
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
