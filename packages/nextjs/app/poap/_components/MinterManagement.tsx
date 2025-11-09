"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const MinterManagement = () => {
  const { address: connectedAddress } = useAccount();
  const [eventId, setEventId] = useState<string>("");
  const [minterAddress, setMinterAddress] = useState<string>("");
  const [checkEventId, setCheckEventId] = useState<string>("");
  const [checkMinterAddress, setCheckMinterAddress] = useState<string>("");

  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "getOwner",
  });

  const { data: isMinter } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "isEventMinter",
    args:
      checkEventId && checkMinterAddress
        ? ([BigInt(checkEventId), checkMinterAddress] as const)
        : ([undefined, undefined] as const),
  });

  const { writeContractAsync: writeAsync, isPending } = useScaffoldWriteContract({
    contractName: "erc721-example",
  });

  const isOwner = connectedAddress && contractOwner && connectedAddress.toLowerCase() === contractOwner.toLowerCase();

  const handleAddMinter = async () => {
    try {
      if (!eventId || !minterAddress) {
        notification.error("Please fill in all fields");
        return;
      }
      
      await writeAsync({
        functionName: "addEventMinter",
        args: [BigInt(eventId), minterAddress],
      });
      
      notification.success("Minter added successfully!");
      setEventId("");
      setMinterAddress("");
    } catch (e) {
      console.error("Error adding minter:", e);
    }
  };

  const handleCheckMinter = () => {
    if (!checkEventId || !checkMinterAddress) {
      notification.error("Please fill in all fields");
      return;
    }
    // The hook will automatically fetch the data
  };

  return (
    <div className="p-6 bg-base-200 border-2 border-secondary rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-secondary">Minter Management</h3>
      
      {!isOwner && (
        <div className="alert alert-warning mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Only the contract owner can add minters</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Minter Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Add Authorized Minter</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Event ID:</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              placeholder="Event ID"
              disabled={!isOwner || isPending}
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Minter Address:</label>
            <AddressInput
              value={minterAddress}
              onChange={setMinterAddress}
              placeholder="Address to authorize"
              disabled={!isOwner || isPending}
            />
          </div>
          
          <button
            className="btn btn-secondary btn-block"
            onClick={handleAddMinter}
            disabled={!connectedAddress || !isOwner || !eventId || !minterAddress || isPending}
          >
            {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Add Minter"}
          </button>
        </div>

        {/* Check Minter Status Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Check Minter Status</h4>
          <div>
            <label className="block text-sm font-medium mb-2">Event ID:</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={checkEventId}
              onChange={e => setCheckEventId(e.target.value)}
              placeholder="Event ID"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Address to Check:</label>
            <AddressInput
              value={checkMinterAddress}
              onChange={setCheckMinterAddress}
              placeholder="Address to verify"
            />
          </div>
          
          <button className="btn btn-outline btn-secondary btn-block" onClick={handleCheckMinter}>
            Check Status
          </button>

          {checkEventId && checkMinterAddress && (
            <div className={`alert ${isMinter ? "alert-success" : "alert-info"}`}>
              <span>
                {isMinter ? "✓ This address is an authorized minter" : "✗ This address is not a minter"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
