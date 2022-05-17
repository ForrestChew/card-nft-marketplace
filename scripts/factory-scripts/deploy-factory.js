const { ethers } = require('hardhat');

MUMBAI_VRF_COORDINATOR = '0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed';
MUMBAI_KEY_HASH =
  '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f';
MUMBAI_CALL_BACK_GAS_LIMIT = 100000;
MUMBAI_SUBSCRIPTION_ID = 206;
MUMBAI_REQUEST_CONFIRMATIONS = 3;

const deployFactory = async () => {
  const CardFactory = await ethers.getContractFactory('CardFactory');
  const cardFactory = await CardFactory.deploy(
    'Cards Collection',
    'CC',
    MUMBAI_VRF_COORDINATOR,
    MUMBAI_KEY_HASH,
    MUMBAI_CALL_BACK_GAS_LIMIT,
    MUMBAI_SUBSCRIPTION_ID,
    MUMBAI_REQUEST_CONFIRMATIONS
  );
  await cardFactory.deployed();
  console.log('CardFactory deployed to:', cardFactory.address, '\n');
};

deployFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
