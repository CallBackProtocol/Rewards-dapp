# 0xFeedback

This repository contains a demo application with rewards for 0xfeedback end users.

## Features

- Sign in with phone number and authenticate using OTP

## Prerequisites

- Node.js
- NPM package manager
- A NEAR testnet account - Instructions to create an account: https://docs.near.org/tools/near-cli

## Setup

Clone the repository:

Install the dependencies:

```bash
npm i
```

Set up the environment variables: Create a .env file in the root directory of the project and add the following variables:

```bash
NEXT_PUBLIC_NEAR_ACCOUNT_ID=your-near-testnet-account-id
NEXT_PUBLIC_NEAR_PRIVATE_KEY=your-near-testnet-private-key
```

Replace your-near-testnet-account-id with your NEAR testnet account ID and your-near-testnet-private-key with your NEAR testnet private key.

## Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

Open your browser and navigate to http://localhost:3000/multi-chain to access the application.

## Usage

- Select the desired chain (ETH, BNB, or BTC) from the dropdown menu.
- Enter the derivation path for the selected chain.
- Click the "Check Balance" button to fetch the account balance on the selected chain.
- Enter the recipient's address in the "Address" field.
- Enter the amount to send in the "Value" field.
- Click the "Send Transaction" button to initiate the transaction.

## Code Structure

The main components of the application are located in the following files:

- `pages/index.tsx:` The main page of the application that handles user interactions and state management.
- `utils/chain/EVM.ts:` Contains the EVM class that provides functions for interacting with Ethereum and Binance Smart Chain.
- `utils/chain/Bitcoin.ts:` Contains the Bitcoin class that provides functions for interacting with the Bitcoin testnet.
- `utils/contract/signer.ts:` Contains functions for signing transactions using the smart contract.
- `utils/kdf.ts:` Contains functions for key derivation.
