"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const MintPoap = () => {
  const { address: connectedAddress } = useAccount();
  const [eventId, setEventId] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [mintToSelf, setMintToSelf] = useState<boolean>(true);

  const { data: isEventActive } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "isEventActive",
    args: eventId ? ([BigInt(eventId)] as const) : ([undefined] as const),
  });

  const { data: eventName } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "getEventName",
    args: eventId ? ([BigInt(eventId)] as const) : ([undefined] as const),
  });

  const { data: isMinter } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "isEventMinter",
    args:
      eventId && connectedAddress ? ([BigInt(eventId), connectedAddress] as const) : ([undefined, undefined] as const),
  });

  const { writeContractAsync: writeAsync, isPending } = useScaffoldWriteContract({
    contractName: "erc721-example",
  });

  const handleMint = async () => {
    try {
      if (!eventId) {
        notification.error("Please enter an event ID");
        return;
      }

      const recipient = mintToSelf ? connectedAddress : recipientAddress;

      if (!recipient) {
        notification.error("Please enter a recipient address");
        return;
      }

      if (!isEventActive) {
        notification.error("This event is not active");
        return;
      }

      await writeAsync({
        functionName: "mintToken",
        args: [BigInt(eventId), recipient],
      });

      notification.success(`POAP minted successfully to ${recipient}!`);
      setEventId("");
      setRecipientAddress("");
    } catch (e) {
      console.error("Error minting POAP:", e);
    }
  };

  return (
    <div className="p-6 bg-base-100 border-2 border-accent rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-accent">Mint POAP Badge</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Event ID:</label>
          <input
            type="number"
            className="input input-bordered w-full bg-base-200"
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            placeholder="Enter event ID"
            disabled={isPending}
            min="1"
          />
          {eventId && eventName && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Event: </span>
              <span className="text-primary">{eventName}</span>
              {isEventActive !== undefined && (
                <span className={`ml-2 badge ${isEventActive ? "badge-success" : "badge-error"}`}>
                  {isEventActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          )}
          {eventId && isMinter !== undefined && (
            <div className="mt-1 text-sm">
              <span className={`badge ${isMinter ? "badge-info" : "badge-ghost"}`}>
                {isMinter ? "You are authorized to mint" : "You are not a minter for this event"}
              </span>
            </div>
          )}
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={mintToSelf}
              onChange={e => setMintToSelf(e.target.checked)}
              disabled={isPending}
            />
            <span className="label-text">Mint to myself</span>
          </label>
        </div>

        {!mintToSelf && (
          <div>
            <label className="block text-sm font-bold mb-2">Recipient Address:</label>
            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              placeholder="Address to receive POAP"
              disabled={isPending}
            />
          </div>
        )}

        <button
          className="btn btn-accent btn-block btn-lg"
          onClick={handleMint}
          disabled={!connectedAddress || !eventId || (!mintToSelf && !recipientAddress) || isPending}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Mint POAP
            </>
          )}
        </button>

        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm">
            POAPs are soulbound (non-transferable) and can only be minted once per address per event.
          </span>
        </div>
      </div>
    </div>
  );
};
