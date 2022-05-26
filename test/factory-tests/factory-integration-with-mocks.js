const { expect } = require('chai');
const { ethers } = require('hardhat');
const ONE_ETHER = ethers.utils.parseEther('1');
const ZERO_ADDRESS = '0x'.padEnd(42, '0');
const SAMPLE_NFT_URI =
  'https://gateway.pinata.cloud/ipfs/QmVo4Bv31zLRvFiAXL6Z8te1kmuu1gYNEnneyBb2FF2aNp';
const BASE_FEE = '250000000000000000';
const GAS_PRICE_LINK = 1e9;
const KEY_HASH =
  '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f';
const CALL_BACK_GAS_LIMIT = 100000;
const SUBSCRIPTION_ID = 1;
const REQUEST_CONFIRMATIONS = 3;

describe('Card Nft factory integration with mocks', () => {
  let accountOne;
  let accountTwo;
  let accountThree;
  let cardFactory;
  let mockVrf;
  before(async () => {
    [accountOne, accountTwo, accountThree] = await ethers.getSigners();
    const MockVrf = await ethers.getContractFactory('VRFCoordinatorV2Mock');
    mockVrf = await MockVrf.deploy(BASE_FEE, GAS_PRICE_LINK);
    await mockVrf.createSubscription();
    await mockVrf.fundSubscription(1, ONE_ETHER);
    const CardFactory = await ethers.getContractFactory('CardFactory');
    cardFactory = await CardFactory.deploy(
      'TestName',
      'TSTSYM',
      mockVrf.address,
      KEY_HASH,
      CALL_BACK_GAS_LIMIT,
      SUBSCRIPTION_ID,
      REQUEST_CONFIRMATIONS
    );
    await cardFactory.deployed();
    // Mints tokens to be bought by accountTwo
    for (let i = 0; i < 5; i++) {
      const packId = 1;
      await cardFactory.createNFTWithApprovalAdminPack(
        SAMPLE_NFT_URI,
        'Iron',
        packId,
        ZERO_ADDRESS
      );
      await cardFactory.transferFrom(
        accountOne.address,
        accountTwo.address,
        i + 1
      );
    }
  });
  it('Account with complete NFT pack can verify their address for rewards', async () => {
    const packId = 1;
    await cardFactory.connect(accountTwo).verifyCompletePackOwnerShip(packId);
    expect(await cardFactory.s_addressesEligibleForRewards(0)).to.equal(
      accountTwo.address
    );
  });
  describe('requestRandomWords: function', () => {
    it('Should confirm request for random words through emitted event', async () => {
      const requestId = 1;
      const preSeed = 100;
      const numWords = 1;
      await expect(cardFactory.requestRandomWords())
        .to.emit(mockVrf, 'RandomWordsRequested')
        .withArgs(
          KEY_HASH,
          requestId,
          preSeed,
          SUBSCRIPTION_ID,
          REQUEST_CONFIRMATIONS,
          CALL_BACK_GAS_LIMIT,
          numWords,
          cardFactory.address
        );
      await mockVrf.fulfillRandomWords(requestId, cardFactory.address);
    });
    it('Should return random words to cart factory contract', async () => {
      const randomWords = await cardFactory.s_randomWords(0);
      expect(randomWords).to.equal(0);
    });
  });
  describe('distributeRewards: function', () => {
    it('Should distribute rewards', async () => {
      await cardFactory.createNFTWithApprovalAdminForReward(
        SAMPLE_NFT_URI,
        'Gold',
        ZERO_ADDRESS
      );
      await cardFactory.distributeRewards([6]);
      expect(await cardFactory.ownerOf(6)).to.equal(accountTwo.address);
    });
  });
  describe('transferFrom: function', async () => {
    it('Should remove accountTwos eligibility for reward', async () => {
      const tokenIdToTransfer = 1;
      await cardFactory
        .connect(accountTwo)
        .transferFrom(
          accountTwo.address,
          accountOne.address,
          tokenIdToTransfer
        );
      const packAmount = await cardFactory.s_numOfNftsOwnedPerPack(
        1,
        accountTwo.address
      );
      // Will return an empty array and 0 for the length
      console.log(await cardFactory.getEligibleRewardWinners());
      expect(packAmount).to.equal(4);
    });
    it('Should remove accountTwos eligibility when eligibility has length > 1', async () => {
      const tokenIdToTransfer = 1;
      await cardFactory
        .connect(accountTwo)
        .transferFrom(
          accountOne.address,
          accountTwo.address,
          tokenIdToTransfer
        );
      const packAmount = await cardFactory.s_numOfNftsOwnedPerPack(
        1,
        accountTwo.address
      );
      expect(packAmount).to.equal(5);
      const packId = 2;
      for (let i = 7; i < 12; i++) {
        await cardFactory.createNFTWithApprovalAdminPack(
          SAMPLE_NFT_URI,
          'Gold',
          packId,
          ZERO_ADDRESS
        );
        await cardFactory.transferFrom(
          accountOne.address,
          accountThree.address,
          i
        );
      }
      await cardFactory.connect(accountTwo).verifyCompletePackOwnerShip(1);
      await cardFactory.connect(accountThree).verifyCompletePackOwnerShip(2);
      const getEligibleRewardWinners =
        await cardFactory.getEligibleRewardWinners();
      expect(getEligibleRewardWinners[0][0]).to.equal(accountTwo.address);
      expect(getEligibleRewardWinners[0][1]).to.equal(accountThree.address);
      expect(getEligibleRewardWinners[1]).to.equal(2);
      for (let i = 1; i <= 10; i++) {
        await cardFactory.createNFTWithApprovalAdminForReward(
          SAMPLE_NFT_URI,
          'Gold',
          ZERO_ADDRESS
        );
      }
      await cardFactory
        .connect(accountTwo)
        .transferFrom(accountTwo.address, accountOne.address, 3);
      const getEligibleRewardWinnersAfter =
        await cardFactory.getEligibleRewardWinners();
      console.log('The Log', getEligibleRewardWinnersAfter);
      expect(getEligibleRewardWinnersAfter[0][0]).to.equal(
        accountThree.address
      );
      expect(getEligibleRewardWinnersAfter[1]).to.equal(1);
    });
  });
});
