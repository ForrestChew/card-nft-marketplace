const { expect } = require('chai');
const { ethers, assert } = require('hardhat');
const {
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const SAMPLE_NFT_URI =
  'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
const ONE_ETHER = ethers.utils.parseEther('1');
const ONE_ETHER_PLUS_TAX = ethers.utils.parseEther('1.05');

describe('CardNftMarketplace', () => {
  let accountOne;
  let accountTwo;
  let cardMarketplace;
  let cardFactory;
  before(async () => {
    [accountOne, accountTwo] = await ethers.getSigners();
    const CardFactory = await ethers.getContractFactory('CardFactory');
    cardFactory = await CardFactory.deploy('Card', 'CRD');
    await cardFactory.deployed();
    const CardNftMarketplace = await ethers.getContractFactory(
      'CardNftMarketplace'
    );
    cardMarketplace = await CardNftMarketplace.deploy(
      accountOne.address,
      cardFactory.address
    );
    await cardMarketplace.deployed();
    await cardFactory.setMarketplaceAddress(cardMarketplace.address);
    for (let i = 0; i < 3; i++) {
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Gold',
        1,
        cardMarketplace.address
      );
    }
  });
  describe('listPack function', () => {
    it('Should emit NewPackListing event', async () => {
      await expect(cardMarketplace.listPack(ONE_ETHER, [1, 2, 3]))
        .to.emit(cardMarketplace, 'NewPackListing')
        .withArgs(1, ONE_ETHER, accountOne.address, [1, 2, 3]);
    });
    it('CardNftMarketplace should have ownership of listed NFTs', async () => {
      // Confirms that the marketplace smart contract has ownership of the listed NFTs
      for (let i = 1; i <= 3; i++) {
        expect(await cardFactory.ownerOf(i)).to.equal(cardMarketplace.address);
      }
    });
    it('Should confirm that listPack function caller has ownership of pack listing', async () => {
      const packListingsFromAddress =
        await cardMarketplace.getListingsByAddress(accountOne.address);
      // Confirms the correct listing ID
      expect(packListingsFromAddress[0][0]).to.equal(
        ethers.BigNumber.from('1')
      );
      // Confirms the correct listing price
      expect(packListingsFromAddress[0][1]).to.equal(
        ethers.BigNumber.from(ONE_ETHER.toString())
      );
      // Confirms the correct listing seller
      expect(packListingsFromAddress[0][2]).to.equal(accountOne.address);
      // Confirms the correct NFT ids are in listing nft id array
      for (let i = 0; i < 3; i++) {
        expect(packListingsFromAddress[0][3][i]).to.equal(i + 1);
      }
    });
  });
  describe('buyNftPack function', () => {
    it('Should emit ListingSold event', async () => {
      await expect(
        cardMarketplace.connect(accountTwo).buyNftPack(1, accountOne.address, {
          value: ONE_ETHER_PLUS_TAX,
        })
      )
        .to.emit(cardMarketplace, 'ListingSold')
        .withArgs(accountOne.address, accountTwo.address, ONE_ETHER_PLUS_TAX);
    });
    it('accountTwo (the pack buyer) should have control of NFTs in pack listing', async () => {
      for (let i = 1; i <= 3; i++) {
        expect(await cardFactory.ownerOf(i)).to.equal(accountTwo.address);
      }
    });
    it('Should transfer NFT pack price in currency to the NFT pack seller', async () => {
      const packBuyerAccountBal = await accountTwo.getBalance();
      expect(await accountTwo.getBalance()).to.equal(
        packBuyerAccountBal.toString()
      );
    });
  });
  describe('delistPack function', () => {
    it('Should remove listing pack from array by pack listing ID', async () => {
      // Mints 7 more NFTs for a total of 10 NFTs minted and owned by accountTwo
      for (let i = 0; i < 7; i++) {
        await cardFactory
          .connect(accountTwo)
          .createNftWithApprovalUser(SAMPLE_NFT_URI);
      }
      // Approval needs to be reset for the 3 NFTs that have been sold the first time
      await cardFactory
        .connect(accountTwo)
        .setApprovalForAll(cardMarketplace.address, true);
      // Lists 10 packs in marketplace
      for (let i = 0; i < 10; i++) {
        await cardMarketplace.connect(accountTwo).listPack(ONE_ETHER, [i + 1]);
      }
      // Delists individual pack from marketplace
      await cardMarketplace.connect(accountTwo).delistPack(1);
      const listingsByAddress = await cardMarketplace.getListingsByAddress(
        accountTwo.address
      );
      expect(listingsByAddress.length).to.equal(9);
    });
    it('Should delist the 9 other packs', async () => {
      for (let i = 2; i <= 10; i++) {
        await cardMarketplace.connect(accountTwo).delistPack(i);
      }
      const listingsByAddress = await cardMarketplace.getListingsByAddress(
        accountTwo.address
      );
      expect(listingsByAddress.length).to.equal(0);
    });
  });
});
