const { ethers } = require('hardhat');

const deployFactory = async () => {
  const CardFactory = await ethers.getContractFactory('CardFactory');
  const cardFactory = await CardFactory.deploy('Cards Collection', 'CC');
  await cardFactory.deployed();
  console.log('CardFactory deployed to:', cardFactory.address, '\n');
};

deployFactory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
