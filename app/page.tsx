"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import useInitNear from "@/hooks/useInitNear";
// import Input from "@/components/Input";
import Select from "@/components/Select";
import EVM from "@/utils/chain/EVM";
// import Button from "@/components/Button";
import { LuCopy } from "react-icons/lu";
import { toast } from "react-toastify";
import { Bitcoin } from "@/utils/chain/Bitcoin";
import { getRootPublicKey } from "@/utils/contract/signer";
import { ethers, } from 'ethers';
import { createPublicClient, encodeFunctionData } from 'viem'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
  } from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { ChevronRight, PhoneCallIcon } from "lucide-react"
import axios from 'axios'
import { Button } from "@/components/ui/button"
  
// import sendOtp from "@/app/api/twilio/route";

const MPC_PUBLIC_KEY =
  "secp256k1:4HFcTSodRLVCGNVcGc4Mf2fwBBBxv9jxkGdiW2S2CA1y6UpVVRWKj6RX7d7TDt65k2Bj3w9FU4BGtt43ZvuhCnNt";

const chainsConfig = {
  ethereum: {
    providerUrl:
      // "https://sepolia.infura.io/v3/6df51ccaa17f4e078325b5050da5a2dd",
      'https://testnet.sapphire.oasis.io',
    scanUrl: "https://sepolia.etherscan.io",
    name: "ETH",
  },
  bsc: {
    providerUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    scanUrl: "https://testnet.bscscan.com",
    name: "BNB",
  },
  btc: {
    name: "BTC",
    networkType: "testnet" as const,
    // API ref: https://github.com/Blockstream/esplora/blob/master/API.md
    rpcEndpoint: "https://blockstream.info/testnet/api/",
    scanUrl: "https://blockstream.info/testnet",
  },
};

enum Chain {
  ETH = "ETH",
  BNB = "BNB",
  BTC = "BTC",
}

export default function Home() {
  const { register, handleSubmit } = useForm<Transaction>();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const { account, isLoading: isNearLoading } = useInitNear();
  const [derivedPath, setDerivedPath] = useState("");
  const [derivedAddress, setDerivedAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [chain, setChain] = useState<Chain>(Chain.ETH);

  const ethereum = useMemo(() => new EVM(chainsConfig.ethereum), []);

  const bsc = useMemo(() => new EVM(chainsConfig.bsc), []);

  const bitcoin = useMemo(() => new Bitcoin(chainsConfig.btc), []);

  const onSubmit = useCallback(
    async (data: Transaction) => {
      if (!account?.accountId || !derivedPath) {
        throw new Error("Account not found");
      }

      const contractAddress = "0x9742aE2b5FAcCA9648a106da3591582d5D3890C2"

      data.data = 
        encodeFunctionData({
          abi: abi,
          functionName: "mint",
          args: ["0x9742aE2b5FAcCA9648a106da3591582d5D3890C2", "999"],
        }),

      console.log(data)

      // return null;

      setIsSendingTransaction(true);
      try {
        switch (chain) {
          case Chain.BNB:
            await bsc.handleTransaction(
              data,
              account,
              derivedPath,
              MPC_PUBLIC_KEY
            );
            break;
          case Chain.ETH:
            await ethereum.handleTransaction(
              data,
              account,
              derivedPath,
              MPC_PUBLIC_KEY
            );
            break;
          case Chain.BTC:
            await bitcoin.handleTransaction(
              {
                to: data.to,
                value: parseFloat(data.value),
              },
              account,
              derivedPath,
              MPC_PUBLIC_KEY
            );
            break;
          default:
            console.error("Unsupported chain selected");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSendingTransaction(false);
      }
    },
    [account, bsc, chain, derivedPath, ethereum, bitcoin]
  );

  useEffect(() => {
    const getAddress = async () => {
      if (!account) {
        setDerivedAddress("");
        return;
      }

      // const publicKey = await getRootPublicKey(account, Contracts.PRODUCTION);

      // if (!publicKey) {
      //   setDerivedAddress("");
      //   return;
      // }

      let address = "";
      switch (chain) {
        case "ETH":
          address = EVM.deriveProductionAddress(
            account.accountId,
            derivedPath,
            MPC_PUBLIC_KEY
          );
          break;
        case "BTC":
          address = Bitcoin.deriveProductionAddress(
            account.accountId,
            derivedPath,
            MPC_PUBLIC_KEY
          ).address;
          break;
        case "BNB":
          address = EVM.deriveProductionAddress(
            account.accountId,
            derivedPath,
            MPC_PUBLIC_KEY
          );
          break;
      }

      setDerivedAddress(address);
    };

    getAddress();
  }, [account, chain, derivedPath]);

  const getAccountBalance = useCallback(async () => {
    let balance = "";
    switch (chain) {
      case "ETH":
        balance =
          (await ethereum.getBalance(derivedAddress)).slice(0, 8) + " ETH";
        break;
      case "BTC":
        balance =
          (await bitcoin.fetchBalance(derivedAddress)).slice(0, 8) + " BTC";
        break;
      case "BNB":
        balance = (await bsc.getBalance(derivedAddress)).slice(0, 8) + " BNB";
        break;
    }

    setAccountBalance(balance);
  }, [bsc, chain, derivedAddress, ethereum, bitcoin]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState(null);

  const createOtp = async () => {
	const codeVar = '[Code]';
	try {
		const response = await axios.post('http://localhost:3011/createverify', {
		  phoneNumber,
		  codeVar,
		});
		console.log(response.data.message);
		setId(response.data.message);
		setError(null); 
	  } catch (error) {
		console.error('Error sending verification request:', error);
		setError(error.response?.data?.message || 'An error occurred.');
	  }
  }

  const verifyOtp = async () => {
	try {
		const response = await axios.post('http://localhost:3011/checkverify', {
			id,
		  code,
		});
		console.log(response.data.message);
		setError(null); 
	  } catch (error) {
		console.error('Error sending verification request:', error);
		setError(error.response?.data?.message || 'An error occurred.');
	  }
  }

  return (
    <div className="h-screen w-full flex justify-center items-center">
		<div className="bg-gray-800 text-white fixed top-0 w-full z-50 flex items-center justify-between h-16 px-4">
      <a href="/"><h1 className="text-xl font-bold">0xFeedback</h1></a>
      <div className="flex items-center space-x-4">
	  <p className="hover:text-gray-400"> </p>
      </div>
    </div>
      {!account || isNearLoading ? (
        <Loader />
      ) : (
		<div className="flex items-center justify-center h-screen">
			<div className="w-full grid grid-rows-4 justify-between gap-8">
			<div className="text-center text-xl">
				Login with OTP to claim rewards
			</div>
			<div className="flex gap-4">
				<Input placeholder="Phone Number" />
				<Button variant="outline" size="icon" onClick={createOtp}>
					<PhoneCallIcon className="h-4 w-4" />
				</Button>
			</div>
			<div className="flex gap-4">
			<InputOTP maxLength={6}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<Button variant="outline" size="icon" onClick={verifyOtp}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

		</div>
</div>
      )}
    </div>
  );
}
