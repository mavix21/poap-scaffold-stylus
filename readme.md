# 💌 POAP Scaffold Stylus

A decentralized Proof of Attendance Protocol (POAP) implementation built on Arbitrum Stylus, featuring soulbound NFT badges for event attendance tracking. This project demonstrates the capabilities and constraints of Stylus smart contracts while providing a practical application for event organizers.

🚀 **[Live Demo](https://poap-scaffold-stylus.vercel.app/)**

📝 **[Deployed Contract on Arbitrum Sepolia](https://sepolia.arbiscan.io/address/0x88ce529d2c86624f111679de1938ab22ed11d6f8)**

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Smart Contract Details](#-smart-contract-details)
- [Frontend Application](#-frontend-application)
- [Development Journey](#-development-journey)
- [Technical Constraints](#-technical-constraints)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)

## 🎯 Overview

This project implements a Proof of Attendance Protocol (POAP) system using Arbitrum Stylus, allowing event organizers to create events and mint non-transferable NFT badges to attendees. The implementation showcases Rust-based smart contract development on Arbitrum while adhering to the strict 24 KB contract size limit imposed by Stylus.

This project implements a Proof of Attendance Protocol (POAP) system using Arbitrum Stylus, allowing event organizers to create events and mint non-transferable NFT badges to attendees. The implementation showcases Rust-based smart contract development on Arbitrum while adhering to the strict 24 KB contract size limit imposed by Stylus.

### Key Characteristics

- **Soulbound Tokens**: NFT badges are non-transferable, ensuring authenticity of attendance records
- **Event-Based Minting**: One badge per attendee per event, preventing duplicate claims
- **Owner-Controlled**: Only contract owners can create events and mint badges
- **ERC721 Compliant**: Implements full ERC721 standard with Enumerable extension
- **Optimized for Stylus**: Carefully optimized to fit within the 24 KB WASM contract size limit

### Technology Stack

- **Smart Contracts**: Rust with Stylus SDK 0.9.0 and OpenZeppelin Stylus 0.3.0
- **Frontend**: Next.js 16 with TypeScript
- **Blockchain Interaction**: Wagmi, Viem, and RainbowKit
- **Styling**: Tailwind CSS with DaisyUI
- **Development Environment**: Nitro DevNode for local testing

## ✨ Features

### Smart Contract Features

1. **Event Creation**: Contract owners can create events with names and organizer addresses
2. **Badge Minting**: Mint unique, non-transferable NFT badges to event attendees
3. **Attendance Tracking**: Automatic tracking to prevent duplicate badge claims per event
4. **Token Enumeration**: Full ERC721Enumerable support for querying all tokens and owner-specific tokens
5. **Metadata Support**: Dynamic token URI generation in the format `ipfs://{eventId}/{tokenId}`
6. **Access Control**: Ownable pattern for administrative functions

### Frontend Features

1. **Event Management**: Interface for creating new events
2. **Badge Minting**: Mint badges to your address or any specified address
3. **NFT Gallery**: View all minted POAP badges with pagination
4. **Personal Collection**: Display badges owned by connected wallet
5. **Debug Interface**: Comprehensive contract interaction panel for testing
6. **Wallet Integration**: Support for multiple wallet providers via RainbowKit

## 🏗 Architecture

### Smart Contract Architecture

The POAP contract is built using OpenZeppelin Stylus extensions and follows a modular design:

```
Poap Contract
├── ERC721 (Core token functionality)
├── ERC721Metadata (Name, symbol, tokenURI)
├── ERC721Enumerable (Token enumeration)
├── Ownable (Access control)
└── Custom POAP Logic
    ├── Event management
    ├── Attendance tracking
    └── Soulbound enforcement
```

### Storage Structure

```rust
pub struct Poap {
    erc721: Erc721,                    // Core ERC721 implementation
    metadata: Erc721Metadata,          // Token metadata
    enumerable: Erc721Enumerable,      // Enumeration support
    owner: Ownable,                    // Access control
    
    last_token_id: StorageU256,        // Token counter
    last_event_id: StorageU256,        // Event counter
    
    token_event: StorageMap<U256, StorageU256>,              // Token ID -> Event ID
    event_name: StorageMap<U256, StorageString>,             // Event ID -> Name
    event_organizer: StorageMap<U256, StorageAddress>,       // Event ID -> Organizer
    event_active: StorageMap<U256, StorageBool>,             // Event ID -> Active status
    event_attendance: StorageMap<U256, StorageMap<...>>,     // Event -> Address -> Attended
}
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) (v20.18 or higher)
- [Yarn](https://yarnpkg.com/) (v2+)
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/engine/install/)
- [Rust](https://www.rust-lang.org/tools/install) (toolchain 1.89)
- [Cargo Stylus](https://github.com/OffchainLabs/cargo-stylus) (v0.6.1+)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mavix21/poap-scaffold-stylus.git
cd poap-scaffold-stylus
```

2. **Install dependencies**

```bash
yarn install
```

3. **Install Stylus tools**

Using stylusup (recommended):

```bash
curl -s https://stylusup.sh/install.sh | sh
```

Or manually:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Stylus CLI tools
cargo install --force cargo-stylus cargo-stylus-check

# Set up Rust toolchain
rustup default 1.89
rustup target add wasm32-unknown-unknown --toolchain 1.89
```

### Running Locally

The project requires three terminal windows to run all components:

**Terminal 1: Start the local blockchain**

```bash
yarn chain
```

This starts a Nitro DevNode at `http://localhost:8547` (Chain ID: 412346). The node provides a local Stylus-compatible environment for testing.

**Terminal 2: Deploy the smart contract**

```bash
yarn deploy
```

This compiles the Rust smart contract, deploys it to the local network, and generates TypeScript types. The deployment address will be saved in `packages/stylus/deployments/412346_latest.json`.

**Terminal 3: Start the frontend**

```bash
yarn start
```

The Next.js application will be available at `http://localhost:3000`.

### Verifying Contract Size

To check the compiled WASM contract size:

```bash
cd packages/stylus/erc721-example
cargo stylus check --endpoint http://localhost:8547
```

This displays the contract size and verifies it meets the 24 KB limit.

## 📁 Project Structure

```
poap-scaffold-stylus/
├── nitro-devnode/              # Arbitrum Nitro DevNode submodule
│   ├── run-dev-node.sh         # Script to start local blockchain
│   └── stylus-dev/             # Stylus development configuration
│
├── packages/
│   ├── nextjs/                 # Frontend application
│   │   ├── app/                # Next.js app directory
│   │   │   ├── erc-721/        # POAP NFT interface
│   │   │   │   ├── page.tsx    # Main POAP page
│   │   │   │   └── _components/
│   │   │   │       ├── MintSection.tsx    # Event creation & minting UI
│   │   │   │       ├── AllNfts.tsx        # Gallery of all POAPs
│   │   │   │       ├── MyNfts.tsx         # User's POAP collection
│   │   │   │       └── NFTCard.tsx        # Individual POAP display
│   │   │   ├── debug/          # Contract debugging interface
│   │   │   └── blockexplorer/  # Local block explorer
│   │   │
│   │   ├── contracts/
│   │   │   └── deployedContracts.ts  # Auto-generated contract ABIs
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/              # Custom React hooks for contract interaction
│   │   └── scaffold.config.ts  # Frontend configuration
│   │
│   └── stylus/                 # Smart contracts
│       ├── erc721-example/     # POAP contract
│       │   ├── src/
│       │   │   └── lib.rs      # Main contract implementation
│       │   ├── Cargo.toml      # Rust dependencies
│       │   └── rust-toolchain.toml
│       ├── deployments/        # Deployment records
│       └── scripts/            # Deployment and utility scripts
│           ├── deploy.ts       # Main deployment script
│           └── export_abi.ts   # ABI export utility
│
└── README.md                   # This file
```

## 🔧 Smart Contract Details

### Core Functions

#### Administrative Functions

```rust
fn create_event(name: String, organizer: Address) -> Result<U256, PoapError>
```
Creates a new event. Returns the event ID. Owner-only function.

```rust
fn mint_token(event_id: U256, to: Address) -> Result<U256, PoapError>
```
Mints a POAP badge for a specific event to an address. Owner-only function. Validates that:
- Event exists and is active
- Recipient has not already received a badge for this event

```rust
fn transfer_ownership(new_owner: Address) -> Result<(), ownable::Error>
```
Transfers contract ownership to a new address.

#### Query Functions

```rust
fn balance_of(owner: Address) -> Result<U256, erc721::Error>
```
Returns the number of tokens owned by an address.

```rust
fn owner_of(token_id: U256) -> Result<Address, erc721::Error>
```
Returns the owner of a specific token.

```rust
fn token_uri(token_id: U256) -> Result<String, erc721::Error>
```
Returns the metadata URI for a token in the format `ipfs://{eventId}/{tokenId}`.

```rust
fn get_event_name(event_id: U256) -> String
```
Returns the name of an event.

```rust
fn total_supply() -> U256
```
Returns the total number of minted tokens.

```rust
fn token_by_index(index: U256) -> Result<U256, erc721::Error>
```
Returns the token ID at a given index in the global token list.

```rust
fn token_of_owner_by_index(owner: Address, index: U256) -> Result<U256, erc721::Error>
```
Returns the token ID at a given index in an owner's token list.

#### Soulbound Enforcement

All transfer functions (`transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll`) are disabled and return `UnauthorizedAction` error, making tokens non-transferable.

### Contract Optimization Strategy

The contract underwent extensive optimization to meet the 24 KB size limit:

1. **Removed event logging**: Eliminated all Solidity-style events to save approximately 200 bytes
2. **Hardcoded base URI**: Removed storage for base URI configuration
3. **Streamlined metadata**: Limited event metadata to only essential fields (name and organizer)
4. **Inlined helper functions**: Merged small utility functions into calling code
5. **Minimal error handling**: Used compact error types instead of detailed messages
6. **Optimized storage**: Used efficient storage patterns to minimize overhead

**Final Statistics**:
- Contract size: 24,338 bytes (23.8 KiB)
- Safety margin: 238 bytes below the 24,576 byte limit
- Lines of code: ~260 lines (reduced from original 537 lines)

### Build Configuration

The contract uses aggressive optimization settings in `Cargo.toml`:

```toml
[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = "z"  # Optimize for size
```

## 💻 Frontend Application

### Main Pages

#### POAP Interface (`/erc-721`)

The primary interface for interacting with the POAP system, featuring:

- **Event Creation Panel**: Form to create new events with name and organizer
- **Badge Minting Panel**: Interface to mint badges to specific addresses for events
- **All POAPs Gallery**: Paginated display of all minted badges across all events
- **My POAPs**: Personal collection view for connected wallet

#### Debug Contracts (`/debug`)

Comprehensive testing interface providing:
- Direct access to all contract functions
- Real-time input validation
- Transaction simulation
- Event monitoring
- State inspection

#### Block Explorer (`/blockexplorer`)

Local blockchain explorer for:
- Transaction history
- Block information
- Address activity
- Contract interactions

### Key Components

#### MintSection Component

Handles event creation and badge minting with two main sections:

```typescript
// Create Event
<form onSubmit={handleCreateEvent}>
  <input name="eventName" />
  <input name="organizer" />
  <button>Create Event</button>
</form>

// Mint Badge
<form onSubmit={handleMintToken}>
  <input name="eventId" />
  <input name="recipientAddress" />
  <button>Mint Badge</button>
</form>
```

#### AllNfts Component

Displays all minted POAP tokens using enumeration:

```typescript
const totalSupply = await contract.read.totalSupply();
for (let i = 0; i < totalSupply; i++) {
  const tokenId = await contract.read.tokenByIndex([BigInt(i)]);
  // Render token card
}
```

#### MyNfts Component

Shows tokens owned by the connected wallet:

```typescript
const balance = await contract.read.balanceOf([address]);
for (let i = 0; i < balance; i++) {
  const tokenId = await contract.read.tokenOfOwnerByIndex([address, BigInt(i)]);
  // Render token card
}
```

### Custom Hooks

The project leverages scaffold-eth hooks for blockchain interaction:

- `useScaffoldContract`: Access contract instance with full TypeScript typing
- `useScaffoldReadContract`: Read contract state with automatic refresh
- `useScaffoldWriteContract`: Execute state-changing transactions
- `useDeployedContractInfo`: Retrieve deployment information

## 📖 Development Journey

### Initial Challenge: Contract Size Exceeded

The development of this POAP system presented significant technical challenges, primarily centered around the Arbitrum Stylus constraint of a 24 KB maximum contract size. The initial implementation, based on a feature-rich POAP contract with comprehensive functionality, resulted in a compiled WASM size of 30,069 bytes (29.4 KiB), exceeding the limit by 22.3%.

### Optimization Methodology

To achieve compliance with the size constraint while maintaining core functionality, we conducted 11 iterative optimization waves, employing various size reduction strategies:

#### Wave 1: Remove ERC721Enumerable Extension (1,370 bytes saved)
Initially removed the enumerable extension to reduce size, though this was later restored in the final version after achieving sufficient optimization elsewhere.

#### Wave 2: Simplify Event Metadata Storage (898 bytes saved)
Restructured event data storage to use primitive types instead of complex structs, eliminating serialization overhead.

#### Wave 3: Remove Non-Essential Features (2,180 bytes saved)
Eliminated pause functionality, merged error types, and removed batch minting capabilities that were not critical for the POAP use case.

#### Wave 4-6: Storage Optimization (540 bytes saved)
- Removed event minter permissions tracking
- Hardcoded base URI instead of storing it
- Consolidated storage maps

#### Wave 7-10: Code Reduction (324 bytes saved)
- Flattened data structures
- Inlined helper functions
- Removed query convenience functions
- Eliminated getter methods that could be replaced with direct storage access

#### Wave 11: Remove Event Logging (2,450 bytes saved)
The most significant single optimization involved removing all Solidity-style event emissions, which provided substantial size savings at the cost of reduced off-chain observability.

**Result**: The optimized contract achieved 22,494 bytes (22.0 KiB), creating an 8.5% safety margin below the limit.

### Feature Restoration Phase

After establishing a base contract well below the size limit, we strategically restored critical features:

#### Restoring Event Names (551 bytes added)
Event names were identified as essential for user experience, allowing readable identification of events rather than relying solely on numeric IDs. This brought the contract to 23,045 bytes (22.5 KiB).

#### Restoring ERC721Enumerable (1,213 bytes added)
The enumerable extension provides crucial functionality for frontend applications to discover and display all tokens. Initial attempts to add this feature encountered challenges:

1. **Misconception about tooling**: Early attempts failed due to using `cargo build` instead of `cargo stylus check` for size verification
2. **Dependency management**: Incorrect assumptions about compilation targets led to concerns about dependency bloat
3. **Resolution**: Using the correct Stylus toolchain (`cargo stylus check`) revealed that full enumeration support could be added while remaining within limits

The final contract with full enumerable support reached 24,258 bytes (23.7 KiB), maintaining a 318-byte safety margin (1.3%).

### TokenURI Export Challenge

A final technical hurdle emerged during frontend integration: the `tokenURI` function was not appearing in the exported ABI despite being defined in the contract. This issue stemmed from the Stylus ABI export mechanism's handling of trait implementations.

**Problem**: Functions defined solely within trait implementations (`impl IErc721Metadata for Poap`) were not being exported to the ABI by `cargo stylus export-abi`.

**Solution**: Added a public wrapper function in the main `#[public]` impl block:

```rust
#[public]
impl Poap {
    #[selector(name = "tokenURI")]
    pub fn token_uri_public(&self, token_id: U256) -> Result<String, erc721::Error> {
        // Implementation
    }
}

#[public]
impl IErc721Metadata for Poap {
    fn token_uri(&self, token_id: U256) -> Result<String, Self::Error> {
        self.token_uri_public(token_id)  // Delegate to public function
    }
}
```

This approach ensured the function appeared in the ABI with the correct `tokenURI` name while maintaining trait compliance.

### Lessons Learned

1. **Toolchain Matters**: Using the correct verification tools (`cargo stylus check` vs `cargo build`) is critical for accurate size measurement
2. **Iterative Optimization**: Systematic, measured optimization passes are more effective than attempting large refactors
3. **Feature Prioritization**: Understanding which features are truly essential vs. "nice-to-have" enables informed trade-offs
4. **ABI Export Quirks**: Stylus ABI generation has specific requirements; public functions must be in the main impl block for proper export
5. **Size Budget Management**: Maintaining a safety margin is crucial for future modifications and compiler updates

## ⚠️ Technical Constraints

### Contract Size Limit

Arbitrum Stylus enforces a strict 24 KB (24,576 bytes) limit on compiled WASM contract size. This constraint significantly influenced the design decisions and feature set of the POAP contract.

**Implications**:
- No event logging (Solidity `emit` equivalent)
- Limited metadata fields (only name and organizer, no description or date)
- Minimal error messages
- No complex query aggregations
- Hardcoded configuration values

### Gas Considerations

While Stylus contracts generally offer lower gas costs compared to EVM contracts, certain operations remain expensive:
- Storage writes (event creation, minting)
- String operations (event name storage)
- Cross-contract calls

The contract design minimizes storage operations and uses efficient data structures to optimize gas consumption.

### Soulbound Token Limitations

The non-transferable nature of POAP badges creates specific constraints:
- No secondary markets
- Cannot consolidate tokens across wallets
- Lost private keys mean lost badges permanently
- No delegation or lending mechanisms

These limitations are intentional and align with the POAP philosophy of proving authentic attendance.

## 🔮 Future Improvements

### Potential Enhancements

1. **Off-Chain Event Logging**
   - Implement indexer service to track contract events via transaction parsing
   - Provide searchable event history without on-chain storage

2. **IPFS Metadata Integration**
   - Deploy actual JSON metadata to IPFS
   - Include event images, descriptions, and dates
   - Implement metadata upload service for event creators

3. **Batch Operations**
   - Optimize multi-recipient minting for large events
   - Implement Merkle tree proof-based claiming to reduce gas costs

4. **Enhanced Access Control**
   - Implement role-based permissions (event organizers vs. contract owner)
   - Allow event-specific minting authorization
   - Add delegate minting capabilities

5. **Contract Upgradeability**
   - Investigate proxy patterns compatible with Stylus
   - Implement versioning for metadata schema evolution

6. **Cross-Chain Bridging**
   - Enable POAP display across multiple Arbitrum chains
   - Implement read-only bridge for viewing collections

7. **Analytics Dashboard**
   - Event attendance statistics
   - Token distribution metrics
   - Collector leaderboards

### Optimization Opportunities

1. **Further Size Reduction**
   - Custom minimal ERC721 implementation instead of OpenZeppelin
   - More aggressive inlining and macro usage
   - Alternative encoding schemes for storage

2. **Gas Optimization**
   - Batch storage operations
   - Optimize enumerable tracking algorithms
   - Implement storage packing strategies

## 🤝 Contributing

Contributions are welcome! This project serves as both a practical POAP implementation and an educational resource for Stylus development.

### Areas for Contribution

- Additional frontend features and UI improvements
- Gas optimization strategies
- Documentation and tutorials
- Testing coverage expansion
- Alternative contract implementations
- Integration with other Web3 services

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on local Nitro DevNode
5. Verify contract size remains under limit
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Testing

```bash
# Test smart contracts
yarn stylus:test

# Verify contract size
cd packages/stylus/erc721-example
cargo stylus check --endpoint http://localhost:8547

# Test frontend
yarn start
```

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) for the original frontend framework
- [Arbitrum Foundation](https://arbitrum.foundation/) for Stylus development
- [OpenZeppelin](https://www.openzeppelin.com/) for Stylus smart contract libraries
- The POAP community for inspiration and use case validation

## 📚 Additional Resources

- [Stylus Documentation](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [Cargo Stylus CLI](https://github.com/OffchainLabs/cargo-stylus)
- [OpenZeppelin Stylus Contracts](https://github.com/OpenZeppelin/rust-contracts-stylus)
- [Scaffold-Stylus Documentation](https://arb-stylus.github.io/scaffold-stylus-docs/)
- [POAP Protocol](https://poap.xyz/)

---

Built with ❤️ for the Arbitrum Stylus ecosystem
