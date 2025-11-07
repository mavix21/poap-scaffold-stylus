import type { NextPage } from "next";
import { Card } from "~~/components/Card";
import { AddressClientWrapper } from "~~/components/scaffold-eth/Address/AddressClientWrapper";
import CompassIcon from "~~/icons/CompassIcon";
import DarkBugAntIcon from "~~/icons/DarkBugAntIcon";
import LightBugAntIcon from "~~/icons/LightBugAntIcon";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col justify-between flex-grow pt-10">
        <div className="flex flex-col justify-center flex-grow">
          <div className="px-5">
            <h1 className="text-center">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Scaffold-Stylus</span>
            </h1>
            <div className="flex justify-center items-center space-x-2 my-4">
              <p className="my-2 font-medium text-[#E3066E] dark:text-white">Connected Address:</p>
              <AddressClientWrapper />
            </div>
            <p className="text-center text-lg">
              Get started by editing{" "}
              <code className="italic text-black text-base font-bold max-w-full break-words break-all inline-block bg-[#F0F0F0] dark:bg-white">
                packages/nextjs/app/page.tsx
              </code>
            </p>
            <p className="text-center text-lg">
              Edit your smart contract{" "}
              <code className="italic text-black text-base font-bold max-w-full break-words break-all inline-block bg-[#F0F0F0] dark:bg-white">
                lib.rs
              </code>{" "}
              in{" "}
              <code className="italic text-black text-base font-bold max-w-full break-words break-all inline-block bg-[#F0F0F0] dark:bg-white">
                packages/stylus/your-contract/src
              </code>
            </p>
          </div>
        </div>

        <div className="h-auto sm:h-[306px] mb-3 w-full py-11 bg-white dark:bg-[#050505]">
          <div className="flex justify-center items-center h-full gap-12 flex-col sm:flex-row">
            {/* Debug Contracts Card */}
            <Card
              icon={
                <>
                  <span className="hidden dark:block">
                    <DarkBugAntIcon />
                  </span>
                  <span className="dark:hidden">
                    <LightBugAntIcon />
                  </span>
                </>
              }
              description={<>Tinker with your smart contract using the</>}
              linkHref="/debug"
              linkText="Debug Contracts"
            />
            {/* Block Explorer Card */}
            <Card
              icon={<CompassIcon />}
              description={<>Explore your local transactions with the</>}
              linkHref="/blockexplorer"
              linkText="Block Explorer"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
