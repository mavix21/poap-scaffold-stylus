#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::{string::String, vec::Vec};

use openzeppelin_stylus::{
    access::ownable::{self, Ownable, OwnableInvalidOwner, OwnableUnauthorizedAccount},
    token::erc721::{
        self,
        extensions::{Erc721Enumerable, Erc721Metadata, IErc721Enumerable, IErc721Metadata},
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
    error UnauthorizedAction();
    error InvalidOperation();
}

#[derive(SolidityError)]
pub enum PoapError {
    UnauthorizedAction(UnauthorizedAction),
    InvalidOperation(InvalidOperation),
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
#[entrypoint]
pub struct Poap {
    erc721: Erc721,
    metadata: Erc721Metadata,
    enumerable: Erc721Enumerable,
    owner: Ownable,

    last_token_id: StorageU256,
    last_event_id: StorageU256,

    token_event: StorageMap<U256, StorageU256>,
    event_name: StorageMap<U256, StorageString>,
    event_organizer: StorageMap<U256, StorageAddress>,
    event_active: StorageMap<U256, StorageBool>,
    event_attendance: StorageMap<U256, StorageMap<Address, StorageBool>>,
}

impl Poap {
    fn ensure_owner(&self) -> Result<(), PoapError> {
        self.owner.only_owner().map_err(PoapError::from)
    }

    fn mint_badge_internal(
        &mut self,
        event_id: U256,
        recipient: Address,
    ) -> Result<U256, PoapError> {
        let new_token_id = self.last_token_id.get() + U256::from(1);
        self.last_token_id.set(new_token_id);

        self.erc721
            ._mint(recipient, new_token_id)
            .map_err(|_| PoapError::InvalidOperation(InvalidOperation {}))?;

        let _ =
            self.enumerable
                ._add_token_to_owner_enumeration(recipient, new_token_id, &self.erc721);
        self.enumerable
            ._add_token_to_all_tokens_enumeration(new_token_id);

        self.token_event.setter(new_token_id).set(event_id);
        self.event_attendance
            .setter(event_id)
            .setter(recipient)
            .set(true);

        Ok(new_token_id)
    }
}

#[public]
#[implements(IErc721Metadata<Error = erc721::Error>, IErc165)]
impl Poap {
    #[constructor]
    fn constructor(&mut self, name: String, symbol: String, _base_uri: String, owner: Address) {
        self.metadata.constructor(name, symbol);
        self.owner._transfer_ownership(owner);
        self.last_token_id.set(U256::ZERO);
        self.last_event_id.set(U256::ZERO);
    }

    fn create_event(&mut self, name: String, organizer: Address) -> Result<U256, PoapError> {
        self.ensure_owner()?;

        let new_event_id = self.last_event_id.get() + U256::from(1);
        self.last_event_id.set(new_event_id);

        self.event_name.setter(new_event_id).set_str(&name);
        self.event_organizer.setter(new_event_id).set(organizer);
        self.event_active.setter(new_event_id).set(true);

        Ok(new_event_id)
    }

    fn mint_token(&mut self, event_id: U256, to: Address) -> Result<U256, PoapError> {
        self.ensure_owner()?;
        if !self.event_active.get(event_id) {
            return Err(PoapError::InvalidOperation(InvalidOperation {}));
        }
        if self.event_attendance.get(event_id).get(to) {
            return Err(PoapError::InvalidOperation(InvalidOperation {}));
        }
        self.mint_badge_internal(event_id, to)
    }

    // ============ SOULBOUND (Non-Transferable) ============

    fn safe_transfer_from(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
    ) -> Result<(), PoapError> {
        Err(PoapError::UnauthorizedAction(UnauthorizedAction {}))
    }

    fn safe_transfer_from_with_data(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
        _data: Bytes,
    ) -> Result<(), PoapError> {
        Err(PoapError::UnauthorizedAction(UnauthorizedAction {}))
    }

    fn transfer_from(
        &mut self,
        _from: Address,
        _to: Address,
        _token_id: U256,
    ) -> Result<(), PoapError> {
        Err(PoapError::UnauthorizedAction(UnauthorizedAction {}))
    }

    fn approve(&mut self, _to: Address, _token_id: U256) -> Result<(), PoapError> {
        Err(PoapError::UnauthorizedAction(UnauthorizedAction {}))
    }

    fn set_approval_for_all(&mut self, _to: Address, _approved: bool) -> Result<(), PoapError> {
        Err(PoapError::UnauthorizedAction(UnauthorizedAction {}))
    }

    // ============ STANDARD ERC721 READ FUNCTIONS ============

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

    // ============ ADMIN FUNCTIONS ============

    fn transfer_ownership(&mut self, new_owner: Address) -> Result<(), ownable::Error> {
        self.owner.transfer_ownership(new_owner)
    }

    fn get_owner(&self) -> Address {
        self.owner.owner()
    }

    fn get_event_name(&self, event_id: U256) -> String {
        self.event_name.get(event_id).get_string()
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri_public(&self, token_id: U256) -> Result<String, erc721::Error> {
        self.erc721.owner_of(token_id)?;
        let event_id = self.token_event.get(token_id);
        Ok(String::from("ipfs://") + &event_id.to_string() + "/" + &token_id.to_string())
    }

    fn total_supply(&self) -> U256 {
        self.enumerable.total_supply()
    }

    fn token_by_index(&self, index: U256) -> Result<U256, erc721::Error> {
        self.enumerable.token_by_index(index).map_err(|_| {
            erc721::Error::NonexistentToken(erc721::ERC721NonexistentToken { token_id: index })
        })
    }

    fn token_of_owner_by_index(&self, owner: Address, index: U256) -> Result<U256, erc721::Error> {
        self.enumerable
            .token_of_owner_by_index(owner, index)
            .map_err(|_| {
                erc721::Error::NonexistentToken(erc721::ERC721NonexistentToken { token_id: index })
            })
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

    fn token_uri(&self, token_id: U256) -> Result<String, Self::Error> {
        self.token_uri_public(token_id)
    }
}

#[public]
impl IErc165 for Poap {
    fn supports_interface(&self, interface_id: B32) -> bool {
        self.erc721.supports_interface(interface_id)
            || <Self as IErc721Metadata>::interface_id() == interface_id
    }
}
