"use client";

import { useState, useEffect } from "react";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface EventInfo {
  id: number;
  name: string;
  organizer: string;
  isActive: boolean;
}

export const EventsList = () => {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const { data: nftContract } = useScaffoldContract({
    contractName: "erc721-example",
  });

  const { data: lastEventId } = useScaffoldReadContract({
    contractName: "erc721-example",
    functionName: "getLastTokenId",
    watch: true,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!nftContract || !lastEventId) return;

      setLoading(true);
      const eventsData: EventInfo[] = [];
      const maxEventId = Math.min(parseInt(lastEventId.toString()), 50); // Limit to 50 events for performance

      for (let eventId = 1; eventId <= maxEventId; eventId++) {
        try {
          const name = await nftContract.read.getEventName([BigInt(eventId)]);
          const organizer = await nftContract.read.getEventOrganizer([BigInt(eventId)]);
          const isActive = await nftContract.read.isEventActive([BigInt(eventId)]);

          if (name) {
            eventsData.push({
              id: eventId,
              name,
              organizer,
              isActive,
            });
          }
        } catch {
          // Event might not exist, skip it
          continue;
        }
      }

      setEvents(eventsData);
      setLoading(false);
    };

    fetchEvents();
  }, [nftContract, lastEventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-3xl font-bold mb-6 text-center">All Events</h3>

      {events.length === 0 ? (
        <div className="text-center p-8 bg-base-100 rounded-2xl border-2 border-base-300">
          <p className="text-lg font-semibold">No events created yet. Create your first event above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <div key={event.id} className="collapse collapse-arrow bg-base-100 border-2 border-base-300">
              <input
                type="radio"
                name="events-accordion"
                checked={expandedEvent === event.id}
                onChange={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              />
              <div className="collapse-title text-xl font-medium flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="badge badge-primary badge-lg">#{event.id}</span>
                  <span>{event.name}</span>
                </div>
                <span className={`badge ${event.isActive ? "badge-success" : "badge-error"}`}>
                  {event.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="collapse-content">
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Organizer:</span>
                    <code className="text-sm bg-base-200 px-2 py-1 rounded font-mono">{event.organizer}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Event ID:</span>
                    <span className="font-semibold">{event.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Status:</span>
                    <span className={event.isActive ? "text-success" : "text-error"}>
                      {event.isActive ? "Active - POAPs can be minted" : "Inactive - Minting disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
