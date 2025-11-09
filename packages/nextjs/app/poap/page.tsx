import type { NextPage } from "next";
import { EventManagement } from "./_components/EventManagement";
import { MinterManagement } from "./_components/MinterManagement";
import { MintPoap } from "./_components/MintPoap";
import { EventsList } from "./_components/EventsList";

const PoapPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col justify-between flex-grow pt-10 px-5">
      <div className="flex flex-col justify-center flex-grow max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-6">POAP Management</h1>
          <div className="space-y-4 text-lg">
            <p>
              Proof of Attendance Protocol (POAP) is a system that allows event organizers to create unique NFT badges
              that commemorate attendance at events.
            </p>
            <p>
              This implementation features event creation, minter management, and attendance tracking. Each POAP is
              soulbound (non-transferable) and can only be minted once per address per event.
            </p>
          </div>
        </div>

        <div className="divider mb-8"></div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Manage Events & Mint POAPs</h2>
          <p className="text-lg mb-6">
            Create events, add authorized minters, and mint POAP badges for event attendees.
          </p>
        </div>

        <div className="space-y-8 mb-8">
          <EventManagement />
          <MinterManagement />
          <MintPoap />
        </div>

        <div className="divider my-8"></div>

        <EventsList />
      </div>
    </div>
  );
};

export default PoapPage;
