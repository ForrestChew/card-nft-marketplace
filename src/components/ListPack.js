import { useEffect, useState } from 'react';
import { useMoralisFile, useMoralis } from 'react-moralis';
import Card from './Card';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import '../styles/list-pack.css';
import '../styles/main.css';

const ListPack = () => {
  const [fileTarget, setFileTarget] = useState('');
  const [nftIds, setNftIds] = useState([]);
  const [packName, setPackName] = useState('');
  const [nftIdsForCard, setNftIdsForCard] = useState(0);
  const [packPriceGlobal, setPackPriceGloabl] = useState(0);

  const { Moralis } = useMoralis();

  const uploadFile = async (e) => {
    e.preventDefault();
    const name = 'PackImg.jpg';
    const file = fileTarget;
    const moralisFile = new Moralis.File(name, file);
    await moralisFile
      .save()
      .then(() => {
        console.log('Success');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const listPackToSmartContract = async () => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    await cardMarketplace.listPack(Moralis.Units.ETH(packPriceGlobal), nftIds);
  };

  const getInputInfoAndCallContract = (e) => {
    e.preventDefault();
    const nftIdsInput = document.getElementsByName('nftIdsArr');
    const packPrice = document.getElementsByName('packPrice');
    for (let i = 0; i < nftIdsInput.length; i++) {
      const packPriceVal = packPrice[i].value;
      const inputNftIdArr = nftIdsInput[i].value.split(' ');
      setNftIds(inputNftIdArr);
      setPackPriceGloabl(packPriceVal);
    }
    listPackToSmartContract();
  };

  const fileInput = (e) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setFileTarget(reader.result);
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const updatePackName = (e) => {
    setPackName(e.target.value);
  };

  const updateNftIds = (e) => {
    setNftIdsForCard(e.target.value);
  };

  const updatePackPrice = (e) => {
    setPackPriceGloabl(e.target.value);
  };

  return (
    <>
      <div className="list-pack-container">
        <form className="list-pack-form">
          <label>Pack Name</label>
          <input
            type="text"
            placeholder="Enter name of pack"
            maxLength="20"
            onChange={updatePackName}
          />
          <label>Price</label>
          <input
            type="number"
            name="packPrice"
            step="0.1"
            placeholder="Pack Price"
            maxLength="15"
            onChange={updatePackPrice}
          />
          <label>NFT Ids to sell</label>
          <input
            type="text"
            name="nftIdsArr"
            placeholder="NFT Ids"
            maxLength="10"
            onChange={updateNftIds}
          />
          <label>Upload pack image photo</label>
          <input
            id="img-input"
            name="img-input"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            onChange={fileInput}
          />
          <button
            className="btn-global"
            style={{ marginTop: '1.5rem' }}
            onClick={getInputInfoAndCallContract}
          >
            List Pack
          </button>
        </form>
        <div className="list-pack"></div>
        <Card
          packName={packName}
          packImg={fileTarget}
          packPrice={packPriceGlobal}
          nftIds={nftIdsForCard}
        />
      </div>
    </>
  );
};

export default ListPack;
