"use client";

import { useAccount } from "wagmi";
import { Address } from "./Address";

export function AddressClientWrapper() {
  const { address } = useAccount();

  return <Address address={address} />;
}
