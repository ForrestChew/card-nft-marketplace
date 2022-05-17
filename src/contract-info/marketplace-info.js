exports.marketplaceAddress = '0xc780B71de5cFa4df529534A0409dD03dC9F6cC2b';

exports.marketplaceAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_marketplaceOwner', type: 'address' },
      { internalType: 'address', name: '_nftCardsAddr', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'ListingSold',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'packListingId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'packPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'packSeller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'nftIds',
        type: 'uint256[]',
      },
    ],
    name: 'NewPackListing',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'packListingId',
        type: 'uint256',
      },
    ],
    name: 'PackDelisted',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_packId', type: 'uint256' },
      { internalType: 'address', name: '_listingSeller', type: 'address' },
    ],
    name: 'buyNftPack',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_packId', type: 'uint256' }],
    name: 'delistPack',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_listingSeller', type: 'address' },
    ],
    name: 'getListingsByAddress',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'packListingId', type: 'uint256' },
          { internalType: 'uint256', name: 'packPrice', type: 'uint256' },
          { internalType: 'address', name: 'packSeller', type: 'address' },
          { internalType: 'uint256[]', name: 'nftIds', type: 'uint256[]' },
        ],
        internalType: 'struct CardNftMarketplace.PackListing[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_packPrice', type: 'uint256' },
      { internalType: 'uint256[]', name: '_nftIds', type: 'uint256[]' },
    ],
    name: 'listPack',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'listingsSeller',
    outputs: [
      { internalType: 'uint256', name: 'packListingId', type: 'uint256' },
      { internalType: 'uint256', name: 'packPrice', type: 'uint256' },
      { internalType: 'address', name: 'packSeller', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketplaceOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nftCardFactory',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'packListingCount',
    outputs: [{ internalType: 'uint256', name: '_value', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
