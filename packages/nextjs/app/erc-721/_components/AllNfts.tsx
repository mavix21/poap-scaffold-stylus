"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  image: string;
  name: string;
}

export const AllNfts = () => {
  const [allNfts, setAllNfts] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: nftContract } = useScaffoldContract({
    contractName: "erc721-example",
  });

  const { data: lastTokenId } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "getLastTokenId",
    watch: true,
  });

  useEffect(() => {
    const updateAllNfts = async (): Promise<void> => {
      if (lastTokenId === undefined || nftContract === undefined) return;

      setLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const maxTokenId = parseInt(lastTokenId.toString());

      for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
        try {
          const owner = await nftContract.read.ownerOf([BigInt(tokenId)]);
          const eventId = await nftContract.read.getTokenEvent([BigInt(tokenId)]);

          collectibleUpdate.push({
            id: tokenId,
            uri: `Token #${tokenId}`,
            owner,
            image: `https://via.placeholder.com/150?text=Event+${eventId}`,
            name: `POAP Token #${tokenId}`,
          });
        } catch {
          // Token might not exist or be burned, skip it
          continue;
        }
      }
      collectibleUpdate.sort((a, b) => a.id - b.id);
      setAllNfts(collectibleUpdate);
      setLoading(false);
    };

    updateAllNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTokenId]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
        <p className="y-2 mr-2 font-bold text-2xl my-2">Total Minted:</p>
        <p className="text-xl">{lastTokenId ? lastTokenId.toString() : 0} tokens</p>
      </div>
      {allNfts.length > 0 && (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {allNfts.map(item => (
            <NFTCard nft={item} key={item.id} />
          ))}
        </div>
      )}
    </>
  );
};
