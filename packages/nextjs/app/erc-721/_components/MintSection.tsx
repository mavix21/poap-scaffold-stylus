"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const MintSection = () => {
  const { address: connectedAddress } = useAccount();
  const [toAddress, setToAddress] = useState<string>("");

  const { writeContractAsync: writeTokenAsync, isMining } = useScaffoldWriteContract({
    contractName: "erc721-example",
  });

  const handleMintSelf = async () => {
    try {
      if (!connectedAddress) return;
      await writeTokenAsync({ functionName: "mint", args: [connectedAddress] });
    } catch (e) {
      console.error("Error while minting token", e);
    }
  };

  const handleMintToAddress = async () => {
    try {
      if (!toAddress) return;
      await writeTokenAsync({ functionName: "mint", args: [toAddress] });
      setToAddress("");
    } catch (e) {
      console.error("Error while minting token", e);
    }
  };

  return (
    <div className="space-y-6 mb-8 p-6 bg-gray-100 dark:bg-black border-2 border-pink-500 rounded-2xl">
      <div className="text-center">
        <button
          className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold rounded-full"
          onClick={handleMintSelf}
          disabled={!connectedAddress || isMining}
        >
          Mint token to your address
        </button>
      </div>

      <div className="rounded-xl p-6 bg-gray-100 dark:bg-black">
        <h3 className="text-2xl font-bold mb-6">Mint token to another address</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">To:</label>
            <div className="border-2 border-pink-500 rounded-2xl">
              <AddressInput value={toAddress} onChange={setToAddress} placeholder="Address" />
            </div>
          </div>
          <div>
            <button
              className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold rounded-full"
              disabled={!connectedAddress || !toAddress || isMining}
              onClick={handleMintToAddress}
            >
              Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
