// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./@context/ContextMixin.sol";

contract NftFactory {
  struct contractData {
    address contractAddress;
    string contractSymbol;
    string contractName;
    address contractOwner;
    bool contractDeployed;
  }

  string[] public symbols;
  address public factoryCreator;
  mapping(bytes32 => string) public symbolPath;
  mapping(bytes32 => contractData) public deployedContracts;
  MintingPress public newNft;

  constructor() {
    factoryCreator = msg.sender;
  }

  function createMintingPress(
    string memory api,
    string memory pressName,
    string memory pressSymbol,
    string memory nftDescr,
    uint initialId,
    string memory pressAuthor,
    string memory newPath
  ) external returns (address) {
    newNft = new MintingPress(
      api,
      pressName,
      pressSymbol,
      nftDescr,
      initialId,
      pressAuthor,
      msg.sender
    );
    address _newNft = address(newNft);
    symbols.push(pressSymbol);
    symbolPath[keccak256(abi.encodePacked(pressSymbol))] = newPath;
    deployedContracts[keccak256(abi.encodePacked(newPath))].contractAddress = _newNft;
    deployedContracts[keccak256(abi.encodePacked(newPath))].contractSymbol = pressSymbol;
    deployedContracts[keccak256(abi.encodePacked(newPath))].contractName = pressName;
    deployedContracts[keccak256(abi.encodePacked(newPath))].contractOwner = msg.sender;
    deployedContracts[keccak256(abi.encodePacked(newPath))].contractDeployed = true;
    return _newNft;
  }

  function getContractBySymbol(string memory _symbol) external view returns (string memory) {
    string memory _pathBySymbol = symbolPath[keccak256(abi.encodePacked(_symbol))];
    return _pathBySymbol;
  }

  function getContractAddress(string memory _path) external view returns (address) {
    address _contractAddress = deployedContracts[keccak256(abi.encodePacked(_path))].contractAddress;
    return _contractAddress;
  }

  function getSymbols() external view returns (string[] memory) {
    return symbols;
  }
}


contract MintingPress is ERC721Enumerable, ContextMixin {

  struct assetData {
    string cid;
    string title;
    uint256 price;
    uint256 royalty;
  }

  struct user {
    uint owner;
    uint manager;
    uint operator;
  }

  address public admin;
  string public pName;
  string public pSymbol;
  string public descr;
  string public author;
  uint public tokenId;
  string private _api;
  uint[] internal _allTokens;
  uint buyNonce = 1000000001;                   //Unique identifier for tokenBuy event
  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a; //standardized royalties interface
  mapping(bytes32 => bool) private _cids;
  mapping(uint => assetData) public tokenData;
  mapping(address => address) private operators;
  mapping(address => mapping(address => bool)) private operatorApprovals;
  mapping(uint => bool) public usedNonces;     //Stores processed nonces
  mapping(address => user) public access;

  //Emitteed when token is sold
  event tokenBuy(
    address _seller,
    address _buyer,
    uint _tokenId,
    uint _tokenPrice,
    uint _royaltyPct,
    uint _date,
    uint buyNonce
  );

  constructor(
    string memory api,
    string memory pressName,
    string memory pressSymbol,
    string memory pressDescription,
    uint initialTokenId,
    string memory pressAuthor,
    address creator
  ) ERC721(pressName, pressSymbol) {
    _api = api;
    pName = pressName;
    pSymbol = pressSymbol;
    descr = pressDescription;
    author = pressAuthor;
    //sets the admin address - msg.sender wil not work here, must be passed from NftFactory
    admin = creator;
    tokenId = initialTokenId;
  }

  //overrides to recognize OpenSea address
  function _msgSender()
    internal
    view
    override(Context)
    returns (address sender)
  {
    return ContextMixin.msgSender();
  }

  //Mints a new token to admin's address
  function mint(
    string memory _cidMeta,
    string memory _cidToken,
    string memory _title
  ) external {
    address _sender = _msgSender();
    require(_sender == admin, "Admin only");
    _safeMint(_sender, tokenId);

    tokenData[tokenId].cid = _cidMeta;
    tokenData[tokenId].title = _title;
    _cids[keccak256(abi.encodePacked(_cidToken))] = true;
    _allTokens.push(tokenId);
    tokenId ++;
  }

  function getApi(address _sender) external view returns (string memory) {
    require(_sender == admin, "Admin only");
    return _api;
  }

  //Returns meta data file IPFS CID for a given token ID
  function getCid(uint _tokenId) public view virtual returns (string memory) {
    string memory _cid = tokenData[_tokenId].cid;
    return _cid;
  }

  //Returns individual asset tite
  function getTitle(uint _tokenId) public view virtual returns (string memory) {
    string memory _title = tokenData[_tokenId].title;
    return _title;
  }

  //Checks if asset has already been minted by looking up IPFS hash (CID)
  function existsCid(string memory _cid) public view virtual returns (bool) {
    bool _existsCid = _cids[keccak256(abi.encodePacked(_cid))];
    return _existsCid;
  }

  //Sets token selling price so it may be sold
  function setPrice(uint _tokenId, uint _tokenPrice) public {
    require(_isApprovedOrOwner(_msgSender(), _tokenId), "Price may be set by owner or approved agent only");
    require(_exists(_tokenId), "Non-existent token");
    tokenData[_tokenId].price = _tokenPrice;
  }

  //Returns selling price for a given token ID
  function getPrice(uint _tokenId) public view virtual returns (uint) {
    uint _price = tokenData[_tokenId].price;
    return _price;
  }


  //Sets royalties for Rarible, to be merged with setCommission() above
  function setRoyalties(uint _tokenId, uint96 _royaltyPct) public {
    address _sender = _msgSender();
    require(_royaltyPct <= 100, "Royalties up to 100% only");
    require(_exists(_tokenId), "Non-existent token");
    require(_sender == admin || _sender == operators[admin], "Admin or approved operator only");
    require(admin == ownerOf(_tokenId), "Token is sold - may not set royalty");
    uint96 _percentageBasisPoints = _royaltyPct * 100;
    tokenData[_tokenId].royalty = _percentageBasisPoints;
  }


  //Returns creator's royalties (%)
  function getRoyalties(uint _tokenId) public view virtual returns (uint) {
    if(tokenData[_tokenId].royalty > 0) {
      uint _royalty = tokenData[_tokenId].royalty / 100;
      return _royalty;
    }
    return 0;
  }


  //royalties - rarible and ERC2981 interface support
  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    if (interfaceId == _INTERFACE_ID_ERC2981) {
      return true;
    }
    return super.supportsInterface(interfaceId);
  }


  //Buy-sell token
  function buyToken(uint _tokenId) external payable {
    uint _price = tokenData[_tokenId].price;
    uint _royalty = _price *  tokenData[_tokenId].royalty / 10000;
    require(_price > 0, 'Token is not for sale');
    require(msg.value == _price, 'Price is incorrect');
    address _seller = ownerOf(_tokenId);
    _safeTransfer(_seller, _msgSender(), _tokenId, "");
    if (_royalty > 0) {
      payable(admin).transfer(_royalty);
    }
    payable(_seller).transfer(_price - _royalty);
    //cancels token manager's access
    if (getApproved(_tokenId) != address(0)) {
      access[getApproved(_tokenId)].manager -= 1;
    }
    tokenData[_tokenId].price = 0;
    emit tokenBuy(_seller, _msgSender(), _tokenId, _price, _royalty, block.timestamp, buyNonce);
    buyNonce++;
  }

  function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId) || _allTokens.length == 0, "ERC721Metadata: URI query for nonexistent token");
      string memory baseURI = _baseURI();
      return bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI, tokenData[_tokenId].cid))
        : '';
  }

  function _baseURI() internal pure override returns (string memory) {
    return "ipfs://";
  }

  function getTokenList() external view virtual returns(uint[] memory) {
    return _allTokens;
  }

  function burn(uint _tokenId) external returns (bool) {
    address _sender = _msgSender();
    require(_isApprovedOrOwner(_sender, _tokenId), "ERC721: transfer caller is not owner nor approved");
    //cancels token manager's access
    if (getApproved(_tokenId) != address(0)) {
      access[getApproved(_tokenId)].manager -= 1;
    }
    _burn(_tokenId);
    address _owner = ownerOf(_tokenId);
    address _operator = getOperator(_owner);
    uint _balance = balanceOf(_owner);

    //cancel operator's access if remaining balance is 0
    if(_balance == 0) {
      operatorApprovals[_owner][_operator] = false;
      operators[_owner] = address(0);
      access[getApproved(_tokenId)].operator -= 1;
    }
    return true;
  }

  function approve(address to, uint256 _tokenId) public virtual override {
    address owner = ERC721.ownerOf(_tokenId);
    require(to != owner, "ERC721: approval to current owner");

    require(
      _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
      "ERC721: approve caller is not owner nor approved for all"
    );
    _approve(to, _tokenId);
    if (to != address(0)) {
      access[to].manager += 1;
    } else {
      access[getApproved(_tokenId)].manager -= 1;
    }
  }

  function setApprovalForAll(address operator, bool approved) public virtual override {
    address _sender = _msgSender();
    require(balanceOf(_sender) > 0, "Do not own any tokens");
    require(operator != _sender, "ERC721: approve to caller");
    address _operator = operator;
    if (approved == false) {
      access[_operator].operator -= 1;
      _operator = address(0);
    } else {
      operatorApprovals[_sender][operator] = approved;
      operators[_sender] = _operator;
      access[_operator].operator += 1;
    }
    emit ApprovalForAll(_sender, _operator, approved);
  }

  function isApprovedForAll(address _owner, address _operator) public view override returns (bool isOperator) {
    //allows OpenSea to operate the tokens: returns true if OpenSea's ERC721 proxy address is detected
    if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
      return true;
    }
    //otherwise - boilerplate ERC721
    return operatorApprovals[_owner][_operator];
  }

  function getOperator(address _owner) public view virtual returns (address) {
    address _operator = operators[_owner];
    return _operator;
  }

  function clearApproval(address _approved, uint _tokenId) public {
    require(getApproved(_tokenId) == _approved, "The address is currently not approved to manage this token");
    approve(address(0), _tokenId);
  }

  //control dashboard access
  function getAccess(address _sender, uint _type) public view virtual returns (bool) {
    bool _access = false;
    if (_type == 1 && balanceOf(_sender) > 0) {_access = true;}
    if (_type == 2 && access[_sender].operator > 0) {_access = true;}
    if (_type == 3 && access[_sender].manager > 0) {_access = true;}
    return _access;
  }

  function getAddress() public view virtual returns(address) {
    address _address = address(this);
    return _address;
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 _tokenId,
    bytes memory _data
  ) public virtual override {
     require(_isApprovedOrOwner(_msgSender(), _tokenId), "ERC721: transfer caller is not owner nor approved");
     setPrice(_tokenId, 0);
     _safeTransfer(from, to, _tokenId, _data);
     if (getApproved(_tokenId) != address(0)) {
       access[getApproved(_tokenId)].manager -= 1;
     }
  }
}
