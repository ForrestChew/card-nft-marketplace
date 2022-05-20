import { useState, useContext, useEffect, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import { AppContext } from './Context';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { factoryAddress, factoryAbi } from '../contract-info/factory-info';
import IsLoading from './IsLoading';
import '../styles/cards.css';
import '../styles/action-info-section.css';
const ActionInfoSection = ({
  packName,
  packImg,
  packPrice,
  packListingId,
  nftCount,
  packSeller,
  nftIds,
}) => {
  console.log(nftIds);
  const [activePack] = useContext(AppContext);
  const [nftImgUrls, setNftImgUrls] = useState([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isLoading, setIsloading] = useState(false);

  const { Moralis } = useMoralis();
  const provider = Moralis.web3;
  const ethers = Moralis.web3Library;
  const cardFactory = new ethers.Contract(factoryAddress, factoryAbi, provider);

  useEffect(() => {
    // Adds NFT img URIs to array to be displayed
    const getNftImgs = async () => {
      setNftImgUrls([]);
      nftIds.map(async (nftId) => {
        setIsloading(true);
        const uri = await cardFactory.tokenURI(nftId);
        fetch(uri)
          .then(async (response) => {
            const resJson = await response.json();
            setNftImgUrls((nftImgUrls) => [...nftImgUrls, resJson['image']]);
          })
          .then(() => {
            setIsloading(false);
          });
      });
    };
    getNftImgs();
  }, [activePack]);

  const nextImg = () => {
    setCurrentImgIdx(
      currentImgIdx === nftImgUrls.length - 1 ? 0 : currentImgIdx + 1
    );
  };
  const prevImg = () => {
    setCurrentImgIdx(
      currentImgIdx === 0 ? nftImgUrls.length - 1 : currentImgIdx - 1
    );
  };

  // console.log(nftImgUrls);

  return (
    <>
      <div className="info-section-container">
        <img src={packImg} width="25%"></img>
        <div className="pack-info">
          {/* <span>{packName}</span> */}
          <span>Pack Id: {packListingId}</span>
          <span>Price: {packPrice} Matic</span>
          <span>NFT Count: {nftCount}</span>
          <span>Seller: {packSeller}</span>
        </div>
      </div>
      <section className="pack-imgs">
        <div className="slide-img">
          <FaArrowRight className="next-img" onClick={() => nextImg()} />
          <FaArrowLeft className="prev-img" onClick={() => prevImg()} />
          {!isLoading ? (
            <img
              src={nftImgUrls[currentImgIdx]}
              className="slide-img"
              width="70%"
            ></img>
          ) : (
            <IsLoading />
          )}
        </div>
      </section>
    </>
  );
};

export default ActionInfoSection;
