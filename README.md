# V3-Quoter

Quoter contract for Uniswap V3 pools that can get quotes via `static-call`.

## Installation

```bash
git clone https://github.com/neocortex404/v3-quoter

cd v3-quoter

npm install
```

## Usage

Create an environment file `.env` with the following content:

```text
INFURA_API_KEY=YOUR_INFURA_API_KEY
CMC_API_KEY=YOUR_COIN_MARKET_CAP_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
MNEMONIC=YOUR_MNEMONIC (Optional)
FORK_BLOCK_NUMBER=BLOCK_NUMBER (Optional)
```

To compile the contracts:

```bash
# compile contracts to generate artifacts and typechain-types
npm run compile

# remove the generated artifacts and typechain-types
npm run clean

# clean and compile
npm run build
```

To run the test

```bash
# to run hardhat test
npm test
```
