import { useState } from 'react';
import { useMoralis } from 'react-moralis';
import Card from './Card';
import {
  marketplaceAddress,
  marketplaceAbi,
} from '../contract-info/marketplace-info';
import { factoryAddress, factoryAbi } from '../contract-info/factory-info';
import '../styles/list-pack.css';
import '../styles/main.css';

const CreateItems = () => {
  const [fileTarget, setFileTarget] = useState('');
  const [packName, setPackName] = useState('');
  const [nftIdsForCard, setNftIdsForCard] = useState(0);
  const [packPriceGlobal, setPackPriceGloabl] = useState(0);
  const [nftUri, setNftUri] = useState('');

  const { Moralis } = useMoralis();

  const uploadImage = async (e) => {
    e.preventDefault();
    const name = 'PackImg.png';
    const packImage = new Moralis.File(name, { base64: fileTarget });
    const PackListings = Moralis.Object.extend('NewPackListings');
    const query = new Moralis.Query(PackListings);
    query.equalTo('name', packName);
    const queryFound = await query.find();
    const listingToUpdate = queryFound[0];
    listingToUpdate.set('packImage', packImage);
    await listingToUpdate.save().then(
      () => {
        console.log('Success');
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const listPackToSmartContract = async (packPrice, nftIds) => {
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardMarketplace = new ethers.Contract(
      marketplaceAddress,
      marketplaceAbi,
      signer
    );
    await cardMarketplace.listPack(
      Moralis.Units.ETH(packPrice),
      nftIds,
      packName,
      { gasLimit: 1000000 }
    );
  };

  const getInputInfoAndCallContract = (e) => {
    e.preventDefault();
    const nftIdsInput = document.getElementsByName('nftIdsArr');
    const packPrice = document.getElementsByName('packPrice');
    const packPriceVal = packPrice[0].value;
    // Splits into array since this value will be an argument for the marketplace
    // smart contract that takes in an array of NFT Ids
    const inputNftIdArr = nftIdsInput[0].value.split(' ');
    // setPackPriceGloabl(packPriceVal);
    listPackToSmartContract(packPriceVal, inputNftIdArr);
  };

  const mintNft = async (e) => {
    e.preventDefault();
    const provider = Moralis.web3;
    const ethers = Moralis.web3Library;
    const signer = provider.getSigner();
    const cardFactory = new ethers.Contract(factoryAddress, factoryAbi, signer);
    await cardFactory.createNftWithApprovalUser(nftUri);
  };

  const changeUri = (e) => {
    setNftUri(e.target.value);
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
      <div className="create-items-container">
        <div className="container">
          <form>
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
            <button
              className="btn-global"
              style={{ marginTop: '1.5rem' }}
              onClick={uploadImage}
            >
              Set Image
            </button>
          </form>
          <Card
            packName={`Pack Name: ${packName}`}
            packImg={fileTarget}
            packPrice={`Price: ${packPriceGlobal}`}
            nftIds={`NFT IDs: ${nftIdsForCard}`}
          />
        </div>
        <div className="container">
          <div className="mint-section">
            <p>Input a token URI to mint NFT</p>
            <form>
              <label>Input NFT URI</label>
              <input
                type="text"
                placeholder="URI you wish to mint"
                onChange={changeUri}
              />
              <button
                className="btn-global"
                style={{ marginTop: '1.5rem' }}
                onClick={mintNft}
              >
                MINT!
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateItems;
