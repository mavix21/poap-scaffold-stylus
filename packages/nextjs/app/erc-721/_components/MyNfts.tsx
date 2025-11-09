"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  image: string;
  name: string;
}

export const MyNfts = () => {
  const { address: connectedAddress } = useAccount();
  const [myNfts, setMyNfts] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: nftContract } = useScaffoldContract({
    contractName: "erc721-example",
  });

  const { data: balance } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  useEffect(() => {
    const updateMyNfts = async (): Promise<void> => {
      if (balance === undefined || nftContract === undefined || connectedAddress === undefined) return;

      setLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(balance.toString());

      // Get last token ID to know the range
      const lastTokenId = await nftContract.read.getLastTokenId();
      const maxTokenId = parseInt(lastTokenId.toString());

      // Check all tokens from 1 to lastTokenId to find owned tokens
      for (let tokenId = 1; tokenId <= maxTokenId && collectibleUpdate.length < totalBalance; tokenId++) {
        try {
          const owner = await nftContract.read.ownerOf([BigInt(tokenId)]);

          if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
            const tokenURI = await nftContract.read.tokenURI([BigInt(tokenId)]);
            const eventId = await nftContract.read.getTokenEvent([BigInt(tokenId)]);

            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              owner: connectedAddress,
              image: `https://via.placeholder.com/150?text=Event+${eventId}`,
              name: `POAP Token #${tokenId}`,
            });
          }
        } catch {
          // Token might not exist or be burned, skip it
          continue;
        }
      }

      if (collectibleUpdate.length === 0 && totalBalance > 0) {
        notification.error("Error fetching your NFTs");
      }

      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyNfts(collectibleUpdate);
      setLoading(false);
    };

    updateMyNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, balance]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
        <p className="y-2 mr-2 font-bold text-2xl my-2">Your Balance:</p>
        <p className="text-xl">{balance ? balance.toString() : 0} tokens</p>
      </div>
      {myNfts.length > 0 && (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myNfts.map(item => (
            <NFTCard nft={item} key={item.id} transfer={true} />
          ))}
        </div>
      )}
    </>
  );
};
