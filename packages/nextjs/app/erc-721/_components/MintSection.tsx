"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const MintSection = () => {
  const { address: connectedAddress } = useAccount();
  const [eventName, setEventName] = useState<string>("");
  const [organizer, setOrganizer] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");

  const { writeContractAsync: writeTokenAsync, isMining } = useScaffoldWriteContract({
    contractName: "erc721-example",
  });

  const handleCreateEvent = async () => {
    try {
      if (!eventName || !organizer) return;
      await writeTokenAsync({
        functionName: "createEvent",
        args: [eventName, organizer],
      });
      setEventName("");
      setOrganizer("");
    } catch (e) {
      console.error("Error while creating event", e);
    }
  };

  const handleMintSelf = async () => {
    try {
      if (!connectedAddress || !eventId) return;
      await writeTokenAsync({
        functionName: "mintToken",
        args: [BigInt(eventId), connectedAddress],
      });
    } catch (e) {
      console.error("Error while minting POAP badge", e);
    }
  };

  const handleMintToAddress = async () => {
    try {
      if (!toAddress || !eventId) return;
      await writeTokenAsync({
        functionName: "mintToken",
        args: [BigInt(eventId), toAddress],
      });
      setToAddress("");
    } catch (e) {
      console.error("Error while minting POAP badge", e);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Create Event Section */}
      <div className="p-6 bg-gray-100 dark:bg-black border-2 border-purple-500 rounded-2xl">
        <h3 className="text-2xl font-bold mb-6">Create New Event</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium mb-2">Event Name:</label>
            <input
              type="text"
              className="input input-bordered w-full border-2 border-purple-500 rounded-xl px-4 py-2"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g., ETH Denver 2025"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Organizer:</label>
            <input
              type="text"
              className="input input-bordered w-full border-2 border-purple-500 rounded-xl px-4 py-2"
              value={organizer}
              onChange={e => setOrganizer(e.target.value)}
              placeholder="e.g., ETH Foundation"
            />
          </div>
          <button
            className="btn btn-secondary btn-lg px-8 py-3 text-lg font-semibold rounded-full"
            onClick={handleCreateEvent}
            disabled={!connectedAddress || !eventName || !organizer || isMining}
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Mint Badge Section */}
      <div className="p-6 bg-gray-100 dark:bg-black border-2 border-pink-500 rounded-2xl">
        <h3 className="text-2xl font-bold mb-6">Mint POAP Badge</h3>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Event ID:</label>
          <input
            type="text"
            className="input input-bordered w-full border-2 border-pink-500 rounded-xl px-4 py-2"
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            placeholder="Enter event ID"
          />
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <button
              className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold rounded-full"
              onClick={handleMintSelf}
              disabled={!connectedAddress || !eventId || isMining}
            >
              Mint badge to your address
            </button>
          </div>

          <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-6">
            <h4 className="text-xl font-bold mb-4">Mint to another address</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-2">To:</label>
                <div className="border-2 border-pink-500 rounded-2xl">
                  <AddressInput value={toAddress} onChange={setToAddress} placeholder="Recipient address" />
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold rounded-full"
                disabled={!connectedAddress || !toAddress || !eventId || isMining}
                onClick={handleMintToAddress}
              >
                Mint Badge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
