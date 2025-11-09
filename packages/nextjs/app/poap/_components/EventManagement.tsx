"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const EventManagement = () => {
  const { address: connectedAddress } = useAccount();
  const [eventName, setEventName] = useState<string>("");
  const [organizer, setOrganizer] = useState<string>("");

  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "getOwner",
  });

  const { writeContractAsync: writeAsync, isPending } = useScaffoldWriteContract({
    contractName: "erc721-example",
  });

  const isOwner = connectedAddress && contractOwner && connectedAddress.toLowerCase() === contractOwner.toLowerCase();

  const handleCreateEvent = async () => {
    try {
      if (!eventName || !organizer) {
        notification.error("Please fill in all fields");
        return;
      }

      await writeAsync({
        functionName: "createEvent",
        args: [eventName, organizer],
      });

      notification.success("Event created successfully!");
      setEventName("");
      setOrganizer("");
    } catch (e) {
      console.error("Error creating event:", e);
    }
  };

  return (
    <div className="p-6 bg-base-100 border-2 border-primary rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-primary">Create New Event</h3>

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
          <span>Only the contract owner can create events</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Event Name:</label>
          <input
            type="text"
            className="input input-bordered w-full bg-base-200"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="e.g., ETH Denver 2025"
            disabled={!isOwner || isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Organizer Address:</label>
          <AddressInput
            value={organizer}
            onChange={setOrganizer}
            placeholder="Organizer address"
            disabled={!isOwner || isPending}
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleCreateEvent}
          disabled={!connectedAddress || !isOwner || !eventName || !organizer || isPending}
        >
          {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Create Event"}
        </button>
      </div>
    </div>
  );
};
