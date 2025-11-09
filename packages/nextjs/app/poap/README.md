# POAP Management Page

A comprehensive Next.js interface for managing Proof of Attendance Protocol (POAP) NFTs.

## Features

### 1. Event Management

- **Create New Events** (Owner only)
  - Set event name
  - Assign an organizer address
  - Organizer is automatically added as an authorized minter
  - Only contract owner can create events

### 2. Minter Management

- **Add Authorized Minters** (Owner only)
  - Add addresses authorized to mint POAPs for specific events
  - Validate event exists before adding minters
  - Only contract owner can add minters

- **Check Minter Status**
  - Verify if an address is authorized to mint for a specific event
  - Real-time status checking

### 3. Mint POAP Badges

- **Flexible Minting Options**
  - Mint to yourself or another address
  - Shows event name and status
  - Displays minter authorization status
  - Only authorized minters or contract owner can mint

- **Smart Validations**
  - Event must be active
  - One POAP per address per event (attendance tracking)
  - POAPs are soulbound (non-transferable)

### 4. Events List

- **View All Events**
  - Displays all created events
  - Shows event ID, name, organizer, and active status
  - Collapsible accordion for detailed view
  - Real-time updates

## Components

- `EventManagement.tsx` - Create new events
- `MinterManagement.tsx` - Add and check minters
- `MintPoap.tsx` - Mint POAP badges
- `EventsList.tsx` - View all events

## Access Control

- **Contract Owner**: Can create events and add minters
- **Event Minters**: Can mint POAPs for their assigned events
- **Anyone**: Can view events and check minter status

## Smart Contract Integration

Uses these contract functions:

- `createEvent(name, organizer)` - Create a new event
- `addEventMinter(eventId, minter)` - Add authorized minter
- `mintToken(eventId, recipient)` - Mint POAP badge
- `isEventMinter(eventId, address)` - Check minter status
- `getEventName(eventId)` - Get event name
- `getEventOrganizer(eventId)` - Get organizer address
- `isEventActive(eventId)` - Check if event is active

## UI/UX Features

- Color-coded sections (Primary, Secondary, Accent)
- Real-time validation and feedback
- Loading states for async operations
- Alert messages for permissions and status
- Responsive grid layout
- DaisyUI theming support
- Toggle for mint-to-self vs mint-to-address
- Accordion view for events list

## Navigation

Access via the header menu: **POAP**

Route: `/poap`
