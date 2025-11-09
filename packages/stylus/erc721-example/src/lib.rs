#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::{string::String, vec::Vec};

use openzeppelin_stylus::{
    access::ownable::{self, Ownable, OwnableInvalidOwner, OwnableUnauthorizedAccount},
    token::erc721::{
        self,
        extensions::{
            enumerable, Erc721Enumerable, Erc721Metadata, IErc721Enumerable, IErc721Metadata,
        },
        Erc721, IErc721,
    },
    utils::introspection::erc165::IErc165,
};

use alloy_sol_types::sol;
use stylus_sdk::{
    abi::Bytes,
    alloy_primitives::{aliases::B32, Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageBool, StorageMap, StorageString, StorageU256},
};

sol! {
    error TransferDisabled();
    error OnlyEventMinterOrOwner();
    error TokenAlreadyMinted(address recipient, uint256 eventId);
    error EventDoesNotExist(uint256 eventId);
    error Paused();
    error MintFailed();

    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event EventMinterAdded(uint256 indexed eventId, address indexed minter);
    event EventMinterRemoved(uint256 indexed eventId, address indexed minter);
    event BadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 indexed eventId);
}

#[derive(SolidityError)]
pub enum PoapError {
    TransferDisabled(TransferDisabled),
    OnlyEventMinterOrOwner(OnlyEventMinterOrOwner),
    TokenAlreadyMinted(TokenAlreadyMinted),
    EventDoesNotExist(EventDoesNotExist),
    Paused(Paused),
    MintFailed(MintFailed),
    OwnableUnauthorizedAccount(OwnableUnauthorizedAccount),
    OwnableInvalidOwner(OwnableInvalidOwner),
}

impl From<ownable::Error> for PoapError {
    fn from(error: ownable::Error) -> Self {
        match error {
            ownable::Error::UnauthorizedAccount(err) => PoapError::OwnableUnauthorizedAccount(err),
            ownable::Error::InvalidOwner(err) => PoapError::OwnableInvalidOwner(err),
        }
    }
}

#[storage]
pub struct EventData {
    name: StorageString,
    description: StorageString,
    image_uri: StorageString,
    date: StorageString,
    organizer: StorageAddress,
    active: StorageBool,
}

#[storage]
#[entrypoint]
pub struct Poap {
    erc721: Erc721,
    metadata: Erc721Metadata,
    enumerable: Erc721Enumerable,
    owner: Ownable,

    last_token_id: StorageU256,
    last_event_id: StorageU256,

    token_event: StorageMap<U256, StorageU256>,
    events: StorageMap<U256, EventData>,
    event_minters: StorageMap<U256, StorageMap<Address, StorageBool>>,
    event_attendance: StorageMap<U256, StorageMap<Address, StorageBool>>,

    base_uri: StorageString,

    paused: StorageBool,
}

impl Poap {
    fn ensure_owner(&self) -> Result<(), PoapError> {
        self.owner.only_owner().map_err(PoapError::from)
    }

    fn ensure_not_paused(&self) -> Result<(), PoapError> {
        if self.paused.get() {
            Err(PoapError::Paused(Paused {}))
        } else {
            Ok(())
        }
    }

    fn ensure_event_active(&self, event_id: U256) -> Result<(), PoapError> {
        if self.events.get(event_id).active.get() {
            Ok(())
        } else {
            Err(PoapError::EventDoesNotExist(EventDoesNotExist {
                eventId: event_id,
            }))
        }
    }

    fn ensure_mint_permissions(&self, event_id: U256) -> Result<(), PoapError> {
        let is_minter = self.event_minters.get(event_id).get(self.vm().msg_sender());

        if is_minter || self.owner.only_owner().is_ok() {
            Ok(())
        } else {
            Err(PoapError::OnlyEventMinterOrOwner(OnlyEventMinterOrOwner {}))
        }
    }

    fn ensure_recipient_not_attending(
        &self,
        event_id: U256,
        recipient: Address,
    ) -> Result<(), PoapError> {
        if self.event_attendance.get(event_id).get(recipient) {
            Err(PoapError::TokenAlreadyMinted(TokenAlreadyMinted {
                recipient,
                eventId: event_id,
            }))
        } else {
            Ok(())
        }
    }

    fn next_token_id(&mut self) -> U256 {
        let new_token_id = self.last_token_id.get() + U256::from(1);
        self.last_token_id.set(new_token_id);
        new_token_id
    }

    fn mint_badge_internal(
        &mut self,
        event_id: U256,
        recipient: Address,
    ) -> Result<U256, PoapError> {
        let new_token_id = self.next_token_id();

        self.erc721
            ._mint(recipient, new_token_id)
            .map_err(|_| PoapError::MintFailed(MintFailed {}))?;

        self.token_event.setter(new_token_id).set(event_id);
        self.event_attendance
            .setter(event_id)
            .setter(recipient)
            .set(true);

        let _ =
            self.enumerable
                ._add_token_to_owner_enumeration(recipient, new_token_id, &self.erc721);
        self.enumerable
            ._add_token_to_all_tokens_enumeration(new_token_id);

        stylus_sdk::stylus_core::log(
            self.vm(),
            BadgeMinted {
                recipient,
                tokenId: new_token_id,
                eventId: event_id,
            },
        );

        Ok(new_token_id)
    }

    fn build_token_uri(&self, token_id: U256) -> Result<String, erc721::Error> {
        self.erc721.owner_of(token_id)?;

        let event_id = self.token_event.get(token_id);
        let base = self.base_uri.get_string();
        let event_str = event_id.to_string();
        let token_str = token_id.to_string();

        Ok(base + &event_str + "/" + &token_str)
    }
}

#[public]
#[implements(IErc721Metadata<Error = erc721::Error>, IErc721Enumerable<Error = enumerable::Error>, IErc165)]
impl Poap {
    #[constructor]
    fn constructor(&mut self, name: String, symbol: String, base_uri: String, owner: Address) {
        self.metadata.constructor(name, symbol);

        self.owner._transfer_ownership(owner);

        self.base_uri.set_str(base_uri);

        self.last_token_id.set(U256::ZERO);
        self.last_event_id.set(U256::ZERO);

        self.paused.set(false);
    }

    fn create_event(
        &mut self,
        name: String,
        description: String,
        image_uri: String,
        date: String,
        organizer: Address,
    ) -> Result<U256, PoapError> {
        self.ensure_owner()?;

        let new_event_id = self.last_event_id.get() + U256::from(1);
        self.last_event_id.set(new_event_id);

        let mut event_data = self.events.setter(new_event_id);
        event_data.name.set_str(name.clone());
        event_data.description.set_str(description);
        event_data.image_uri.set_str(image_uri);
        event_data.date.set_str(date);
        event_data.organizer.set(organizer);
        event_data.active.set(true);

        self.event_minters
            .setter(new_event_id)
            .setter(organizer)
            .set(true);

        stylus_sdk::stylus_core::log(
            self.vm(),
            EventCreated {
                eventId: new_event_id,
                name,
                organizer,
            },
        );

        Ok(new_event_id)
    }

    fn add_event_minter(&mut self, event_id: U256, minter: Address) -> Result<(), PoapError> {
        self.ensure_owner()?;
        self.ensure_event_active(event_id)?;

        self.event_minters.setter(event_id).setter(minter).set(true);

        stylus_sdk::stylus_core::log(
            self.vm(),
            EventMinterAdded {
                eventId: event_id,
                minter,
            },
        );

        Ok(())
    }

    fn remove_event_minter(&mut self, event_id: U256, minter: Address) -> Result<(), PoapError> {
        self.ensure_owner()?;
        self.ensure_event_active(event_id)?;

        self.event_minters
            .setter(event_id)
            .setter(minter)
            .set(false);

        stylus_sdk::stylus_core::log(
            self.vm(),
            EventMinterRemoved {
                eventId: event_id,
                minter,
            },
        );

        Ok(())
    }

    fn deactivate_event(&mut self, event_id: U256) -> Result<(), PoapError> {
        self.ensure_owner()?;

        self.events.setter(event_id).active.set(false);

        Ok(())
    }

    fn mint_token(&mut self, event_id: U256, to: Address) -> Result<U256, PoapError> {
        self.ensure_not_paused()?;
        self.ensure_event_active(event_id)?;
        self.ensure_mint_permissions(event_id)?;
        self.ensure_recipient_not_attending(event_id, to)?;

        self.mint_badge_internal(event_id, to)
    }

    fn batch_mint_event_to_many(
        &mut self,
        event_id: U256,
        recipients: Vec<Address>,
    ) -> Result<Vec<U256>, PoapError> {
        self.ensure_not_paused()?;
        self.ensure_event_active(event_id)?;
        self.ensure_mint_permissions(event_id)?;

        let mut token_ids = Vec::new();

        for recipient in recipients {
            if self
                .ensure_recipient_not_attending(event_id, recipient)
                .is_err()
            {
                continue;
            }

            if let Ok(new_token_id) = self.mint_badge_internal(event_id, recipient) {
                token_ids.push(new_token_id);
            }
        }

        Ok(token_ids)
    }

    // ============ SOULBOUND (Non-Transferable) ============

    fn safe_transfer_from(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
    ) -> Result<(), PoapError> {
        Err(PoapError::TransferDisabled(TransferDisabled {}))
    }

    fn safe_transfer_from_with_data(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
        _data: Bytes,
    ) -> Result<(), PoapError> {
        Err(PoapError::TransferDisabled(TransferDisabled {}))
    }

    fn transfer_from(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
    ) -> Result<(), PoapError> {
        Err(PoapError::TransferDisabled(TransferDisabled {}))
    }

    fn approve(&mut self, _to: Address, _token_id: U256) -> Result<(), PoapError> {
        Err(PoapError::TransferDisabled(TransferDisabled {}))
    }

    fn set_approval_for_all(&mut self, _to: Address, _approved: bool) -> Result<(), PoapError> {
        Err(PoapError::TransferDisabled(TransferDisabled {}))
    }

    /// Returns the metadata URI for a token (constructs from eventId and tokenId)
    #[selector(name = "tokenURI")]
    fn token_uri(&self, token_id: U256) -> Result<String, erc721::Error> {
        self.build_token_uri(token_id)
    }

    // ============ QUERY FUNCTIONS ============

    fn token_event(&self, token_id: U256) -> U256 {
        self.token_event.get(token_id)
    }

    /// Check if an address attended a specific event
    fn has_attended(&self, event_id: U256, attendee: Address) -> bool {
        self.event_attendance.get(event_id).get(attendee)
    }

    /// Check if an address is a minter for an event
    fn is_event_minter(&self, event_id: U256, minter: Address) -> bool {
        self.event_minters.get(event_id).get(minter)
    }

    /// Get event details
    fn get_event_name(&self, event_id: U256) -> String {
        self.events.get(event_id).name.get_string()
    }

    fn get_event_description(&self, event_id: U256) -> String {
        self.events.get(event_id).description.get_string()
    }

    fn get_event_image_uri(&self, event_id: U256) -> String {
        self.events.get(event_id).image_uri.get_string()
    }

    fn get_event_date(&self, event_id: U256) -> String {
        self.events.get(event_id).date.get_string()
    }

    fn get_event_organizer(&self, event_id: U256) -> Address {
        self.events.get(event_id).organizer.get()
    }

    fn is_event_active(&self, event_id: U256) -> bool {
        self.events.get(event_id).active.get()
    }

    fn get_last_event_id(&self) -> U256 {
        self.last_event_id.get()
    }

    fn get_last_token_id(&self) -> U256 {
        self.last_token_id.get()
    }

    // ============ STANDARD ERC721 READ FUNCTIONS ============

    #[selector(name = "totalSupply")]
    fn total_supply(&self) -> U256 {
        self.enumerable.total_supply()
    }

    fn balance_of(&self, owner: Address) -> Result<U256, erc721::Error> {
        self.erc721.balance_of(owner)
    }

    fn owner_of(&self, token_id: U256) -> Result<Address, erc721::Error> {
        self.erc721.owner_of(token_id)
    }

    fn get_approved(&self, token_id: U256) -> Result<Address, erc721::Error> {
        self.erc721.get_approved(token_id)
    }

    fn is_approved_for_all(&self, owner: Address, operator: Address) -> bool {
        self.erc721.is_approved_for_all(owner, operator)
    }

    fn name(&self) -> String {
        self.metadata.name()
    }

    fn symbol(&self) -> String {
        self.metadata.symbol()
    }

    #[selector(name = "tokenOfOwnerByIndex")]
    fn token_of_owner_by_index(
        &self,
        owner: Address,
        index: U256,
    ) -> Result<U256, enumerable::Error> {
        Ok(self.enumerable.token_of_owner_by_index(owner, index)?)
    }

    #[selector(name = "tokenByIndex")]
    fn token_by_index(&self, index: U256) -> Result<U256, enumerable::Error> {
        Ok(self.enumerable.token_by_index(index)?)
    }

    // ============ ADMIN FUNCTIONS ============

    fn pause(&mut self) -> Result<(), PoapError> {
        self.owner.only_owner().map_err(PoapError::from)?;
        self.paused.set(true);
        Ok(())
    }

    fn unpause(&mut self) -> Result<(), PoapError> {
        self.owner.only_owner().map_err(PoapError::from)?;
        self.paused.set(false);
        Ok(())
    }

    fn is_paused(&self) -> bool {
        self.paused.get()
    }

    fn transfer_ownership(&mut self, new_owner: Address) -> Result<(), ownable::Error> {
        self.owner.transfer_ownership(new_owner)
    }

    fn get_owner(&self) -> Address {
        self.owner.owner()
    }
}

#[public]
impl IErc721Metadata for Poap {
    type Error = erc721::Error;

    fn name(&self) -> String {
        self.metadata.name()
    }

    fn symbol(&self) -> String {
        self.metadata.symbol()
    }

    #[selector(name = "tokenURI")]
    fn token_uri(&self, token_id: U256) -> Result<String, Self::Error> {
        self.build_token_uri(token_id)
    }
}

#[public]
impl IErc721Enumerable for Poap {
    type Error = enumerable::Error;

    fn total_supply(&self) -> U256 {
        self.enumerable.total_supply()
    }

    fn token_by_index(&self, index: U256) -> Result<U256, Self::Error> {
        Ok(self.enumerable.token_by_index(index)?)
    }

    fn token_of_owner_by_index(&self, owner: Address, index: U256) -> Result<U256, Self::Error> {
        Ok(self.enumerable.token_of_owner_by_index(owner, index)?)
    }
}

#[public]
impl IErc165 for Poap {
    fn supports_interface(&self, interface_id: B32) -> bool {
        self.erc721.supports_interface(interface_id)
            || <Self as IErc721Metadata>::interface_id() == interface_id
            || <Self as IErc721Enumerable>::interface_id() == interface_id
    }
}
