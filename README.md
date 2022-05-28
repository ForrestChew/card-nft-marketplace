# Card NFT Marketplace

**Terminology for the below paragraph:** <br> 
Set    ---> The group to which an NFT belongs. <br>
Pack ---> NFTs being sold together. <br> 
<br>
This project has several different pieces, two smart contracts, a database, and a front-end. Of the smart contracts, one is a marketplace, and the other is an ERC721 token factory. Within the marketplace, users can create and sell packs of owned NFTs that were made in the ERC721 factory contract. When a pack is bought, all NFTs in that pack are transferred to the pack buyer, and the pack seller receives 97% of the total sale. The marketplace owner receives a 3% transaction fee. <br>
To incentivize users to continuously buy and sell packs, NFTs created by the marketplace owner can be created as part of a set. If a user collects all NFTs belonging to the same set, their account will be eligible for rewards in the form of NFTs. Each set that a user completes will increase their reward multiplier by a factor of one. This will give them higher odds of winning an NFT when rewards are distributed. The mechanism that distributes rewards relies on the Chainlink VRF Oracle. For every five addresses that are eligible for rewards, one NFT will be randomly distributed amongst the addresses. _note: The first 1 - 4 addresses have a chance to receive one NFT reward._ <br>
Each NFT created in the factory smart contract has one of three rarities assigned to it with increasing scarcity. They are, "Iron", "Gold", and "Diamond". Naturally the diamond NFTs will be worth the most while both the gold and diamond NFTs have a chance to become ultra scarce, and therefore, ultra valuable. This can happen since users have a way to mint NFTs within the factory smart contract (through the front-end). The catch is that NFTs created by users (not owners) will always start as iron NFTs. As the iron NFTs flood the market, the value of the gold and diamond NFTs will increase as they become even rarer. <br>

*Note: Project developed and tested on the Mumbai network*

# Project Requirements
1) Moralis Server
2) Web3 provider - Alchemy, Infura, etc....
3) Private Key
4) Polygon api key
5) VRF Subscription (Funded with LINK)
6) IPFS CLI

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
npx hardhat run scripts/factory-scripts/set-marketplace-address.js --network mumbai
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
## 7) Create NFT Metadata
Run the python scripts found `root/nft_collection_builder/create_collection_metadata.py` to create NFT collection metadata. The script
will require four specified parameters including: <br>
- Image file names
- Path to text file with names for the NFTs
- Path to text file with descriptions for the NFTs
- Amount of NFTs <br>
More info can be found in the script file, but it's core functionality is to upload images to IPFS, create metadata for each image uploaded using the names the descriptions provided, then pin both the images and metadata to Pinata. <br>
As files will be iploaded to IPFS, you will need to run a server.
```
ipfs daemon
```
Then run:
```
python nft_collection_builder/create_collection_metadata.py
```
If the above steps were followed correctly your terminal output should look like:
ADD PHOTO <br>
And two directories should be created, one with each NFTs metadata, the other with hashse of your Pinata url.
ADD PHOTO <br>
## Step 8) Mint NFTs
To mint the NFT meta data, run the command:
```
npx hardhat run scripts/factory-scripts/create-nft-collection.js --network mumbai
```
The reason NFTs are not minted in the script that generates the metadata, is to seperate functionality that interacts with any smart contract. This is done to minimize errors that could arrise while minting. <br>
A successful mint should look like:
ADD PHOTO
ADD POLYSCAN PHOTO
The function used to mint the NFT metadata is the `createNFTWithApprovalAdminPack`. This function took four arguments: <br>
- The NFT Uri
- The NFT rarity 
- The Set ID
- The address of the marketplace smart contract
## Step 9) Configure your Moralis Server
Create and configure a Moralis server to be on the Mumbai network. Documentation can be found: <br>
https://docs.moralis.io/moralis-dapp/getting-started
Create an event sync in your Moralis server to listen to the `NewPackListing` event omitted from the marketplace smart contract. Documentation can be found: <br>
https://docs.moralis.io/moralis-dapp/automatic-transaction-sync/smart-contract-events
## Step 10) Start Front-end
```
npm start
```
# Navigating the front-end:

The front-end of this project serves as an interface for users to interact with the protocol, and there are three main components. <br> 
## 1) Marketplace:
Users can browse packs they would like to buy. They can also view the contents of the pack to check what NFTs are inside. When a pack is listed, the Moralis server picks up the `NewPackListing` event omitted from the CardMarketplace smart contract. A table is then created with the fields from omitted event. These tables are then queried from the front-end to be displayed.
ADD PHOTO
Each pack will display: <br>
- Pack image - The image shown on the pack.
- Pack Name - The name of the pack.
- Pack Price - The price of the pack.
- Pack ID - The ID of the pack.
- NFT IDs - The NFT ids that the pack contains.
- Details button - Displays pack info on click. <br>
All of these fields are set by the pack lister.
Clicking the `details` button will display the contents of the pack.
ADD PHOTO
You can use the arrows to switch between the NFTs contained within the pack for more information on that specific NFT. If you would like to buy the NFT, simply click the `Buy` button.
ADD BUY BTN PHOTO
Once the transaction has completed, the pack seller will receive 97% of the total cost, while the marketplace owner receives a 3% transaction fee and the buyer will receieve all NFTs contained in the pack. The table pack listing in the Moralis server will then be deleted.
## 2) Create Items: <br>
This is where users can create an NFT pack, preview it, and list it for sale. Users can also mint an Iron NFT provided they already have a metadata URI.
ADD PHOTO
As the user inputs information into the form, the pack preview will update dynamically to reflect the users's changes. The NFT IDs should be seperated with a space. The user must click the `List Pack` button before clicking the `Set Image` button. <br>
Users can also mint Iron NFTs provided they have a URI. They just need to input the URI into the box and click `MINT!`.

## 3) Profile: 
The profile tab will show a user NFT packs that they have listed, and it will show them owned NFTs that were created in the ERC721 CardFactory smartcontract. 
ADD PHOTO OF PROFILE
In addition, it will give users options to: 
- Check how many NFTs you own in a set. 
- Check the rarity of an NFT based on the input token ID.  
- Verify that you have a complete NFT set to become eligible for rewards. 
- View listing pack IDs that an input address is selling. 
- View addresses who are eligible for rewards. 
ADD PHOTO OF OPTIONS STRIP

# Rewards 
When a user has a complete set of NFTs (meaning they have 5 NFTs that belong to the same set ID), they can then use the `Set ID to Verify` input box to become eligible for rewards. For every set a user has completed, their address will be added into the `s_addressesEligibleForRewards` array Whenever they transfer an NFT belonging to that set, their address will be shifted, and then popped off the end of the array. This is how the rewards multiplier works (although a naive implementation). <br>
When the projects owner decides to distribute rewards, they call a Chainlink VRF Oracle and request `s_addressesEligibleForRewards.length / 5 + 1` amount of values to be returned. This ensures that the number of winners in a reward distribution cycle is one winner for every five addresses eligible. The only exception is that `<=` four addresses in the array have a change to receive one reward. The winning addresses(es) are selected by the indexes at which the random values returned from oracle map to. The mumbers returned will be any positive integer, as it is modified to fit `s_addressesEligibleForRewards.length - 1`, thereby, ensuring an address within the bounds of the winners array is selected. <br>
All rewards come in the form of NFTs created by the projects owner. <br>
As the project owner, to request a random number, make sure you have a VRF subscription, have funded it with Mumbai LINK and connected your CardFactory smart contract to it. <br> Documentation can be found: <br>
General VRF Docs: https://docs.chain.link/docs/get-a-random-number/ <br>
VRF Subscription page: https://vrf.chain.link/mumbai <br>
Once that is complete, run the command: 
```
npx hardhat run scripts/factory-scripts/get-random-numbers.js --network mumbai
```
Once the numbers are returned, the owner can call the `distributeRewards([tokenIdRewards])` to send the winners their reward NFTs.
```
npx hardhat run scripts/factory-scripts/distribute-rewards.js --network mumbai
```
# Testing
To test bot the CardFactory smart contract and the CardMarketplace contract, run the command: br>
```
npx hardhat test
```


