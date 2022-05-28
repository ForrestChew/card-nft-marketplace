# Card NFT Marketplace

**Terminology for the below paragraph:** <br> 
Set    ---> The group to which an NFT belongs. <br>
Pack ---> NFTs being sold together. <br> 
<br>
This project has several different pieces, two smart contracts, a database, and a front-end. Of the smart contracts, one is a marketplace, and the other is an ERC721 token factory. Within the marketplace, users can create and sell packs of owned NFTs that were made in the ERC721 factory contract. When a pack is bought, all NFTs in that pack are transferred to the pack buyer, and the pack seller receives 97% of the total sale. The marketplace owner receives a 3% transaction fee. <br>
To incentivize users to continuously buy and sell packs, NFTs created by the marketplace owner can be created as part of a set. If a user collects all NFTs belonging to the same set, their account will be eligible for rewards in the form of NFTs. Each set that a user completes will increase their reward multiplier by a factor of one. This will give them higher odds of winning an NFT when rewards are distributed. The mechanism that distributes rewards relies on the Chainlink VRF Oracle. For every five addresses that are eligible for rewards, one NFT will be randomly distributed amongst the addresses. _note: The first 1 - 4 addresses have a chance to receive one NFT reward._ <br>
Each NFT created in the factory smart contract has one of three rarities assigned to it with increasing scarcity. They are, "Iron", "Gold", and "Diamond". Naturally the diamond NFTs will be worth the most while both the gold and diamond NFTs have a chance to become ultra scarce, and therefore, ultra valuable. This can happen since users have a way to mint NFTs within the factory smart contract (through the front-end). The catch is that NFTs created by users (not owners) will always start as iron NFTs. As the iron NFTs flood the market, the value of the gold and diamond NFTs will increase as they become even rarer. <br>
The front-end of this project serves as an interface for users to interact with the protocol, and there are four main components. <br> 
1) Marketplace:
Users can browse packs they would like to buy. They can also view the contents of the pack to check what NFTs are inside.
2) Create Items: <br>
This is where users can create an NFT pack, preview it, and list it for sale. Users can also mint an Iron NFT provided they already have a metadata URI.
3) Profile: <br>
Here you can: <br>
a) View owned NFTs belonging to the ERC721 factory smart contract address. <br>
b) View your pack listings with the option to delist it. <br>
c) Check how many NFTs you own in a set. <br>
d) Check the rarity of an NFT based on the input token ID.  <br>
e) Verify that you have a complete NFT set to become eligible for rewards. <br>
f) View listing pack IDs that an input address is selling. <br>
g) View addresses who are eligible for rewards. <br>

*Note: Project developed and tested on the Mumbai network*

# Project Requirements
1) Moralis Server
2) Web3 provider - Alchemy, Infura, etc....
3) Private Key
4) Polygon api key
5) VRF Subscription (Funded with LINK)

# Set up steps 
## 1) Clone Repository
```
git clone https://github.com/ForrestChew/card-nft-marketplace.git
```
## 2) Install dependecies 
```
npm install
```
## 3) Create .env File
In the root of project, add a .env file with the following fields:
- REACT_APP_MORALIS_SERVER_URL=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- REACT_APP_MORALIS_APP_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- MUMBAI_URL=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- PRIVATE_KEY=0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- POLYGONSCAN_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- PINATA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- PINATA_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
## 4) Deploy Smart Contracts
```
npx hardhat run scripts/factory-scripts/deploy-factory.js --network mumbai
```
Before deploying the marketplace smart contract, add the address and ABI of factory smart contract to the 
`root/src/contract-info/factory-info.js` file. Various pieces of the project depend on this information being accurate.
```
npx hardhat run scripts/marketplace-scripts/deploy-marketplace.js --network mumbai
```
Add the marketplace address and ABI to the `root/src/contract-info/marketplace-info.js` file.
## 5) Set Marketplace address in factory
Link the factory smart contracat with marketplace smart contract.
```
npx hardhat run scripts/factory-scripts/set-marketplace-address.js
```
## 6) Verify Smart Contracts
Verify Marketplace smart contract.
```
npx hardhat verify <MARKETPLACE_ADDRESS> <"YOUR_ADDRESS"> <"FACTORY_ADDRESS"> --network mumbai
```
Verify Factory smart contract.
```
npx hardhat verify <FACTORY_ADDRESS> "Cards Collection" "CC" "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed" "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f" <"CALL_BACK_GAS_LIMIT"> <"VRF_SUBSCRIPTION_ID"> <"REQUEST_CONFIRMATIONS"> --network mumbai
```
