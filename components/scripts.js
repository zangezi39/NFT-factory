import MetaDataFetch from './MetaDataFetch';
import ListTokens from './ListTokens';
import GalleryFetch from './GalleryFetch';


export function returnOperator(_operator) {
  if (_operator != '0x0000000000000000000000000000000000000000') {
    const approvedOperator = _operator;
    return approvedOperator;
  } else {
    const approvedOperator = 'None';
    return approvedOperator;
  }
}


//**Fetches and returns metadata and thumbnail for a single specified token
export function returnMetaData(_press, _show, _list, _id) {
  if (_show == true) {
    //**Check if token exists, returns negative number if not found
    if (_list.indexOf(_id) >= 0) {
      try {
        return (
          <MetaDataFetch
            key={_id}
            id={_id}
            press={_press}
          />
        );
      } catch (err) {
        return err.message;
      }
    } else {
      return 'Token does not exist';
    }
  }
}


//**Generates a list of tokens belonging to the specified owner
export function returnOwnedTokens(_show, _list, _press) {
  if (_show == true) {
    try {
      return _list.map((id) => {
        return (
          <ListTokens
            key={id}
            id={id}
            press={_press}
          />
        );
      });
      this.setState({ loading3: false });
    } catch (err) {
      this.setState({ loading3: false, errorMessage3: err.message });
    }
  }
}


//**Generates token gallery
export function returnGalleryItems(_path, _list, _press) {
  if (_list.length > 0) {
    return _list.map((id) => {
      return (
        <GalleryFetch
          key={id}
          id={id}
          press={_press}
          path={_path}
        />
      );
    });
  } else {
    return(
      <div><label><h2>
        <br /><br /><br /><br /><br /><br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        THERE ARE NO MINTED TOKENS YET</h2></label></div>
    )
  }
}

export async function returnTokenList(_listId, _acct, press) {
  let _tokenList = [];
  //generate full token list
  if (_listId == 0) {
    _tokenList = await press.methods.getTokenList().call();
      return _tokenList;
  }
  //generates owned token list
  if (_listId == 1) {
    const _totalOwned = await press.methods.balanceOf(_acct).call();
    if (_totalOwned > 0) {
      let i;
      for (i=0; i < _totalOwned; i++){
        const _tokenOwned = await press.methods.tokenOfOwnerByIndex(_acct, i).call();
        _tokenList.push(_tokenOwned);
      }
    }
    return _tokenList;
  }
  //generates managed token list
  if (_listId == 2) {
    const _totalOwned = await press.methods.balanceOf(_acct).call();
    if (_totalOwned > 0) {
      let i;
      for (i=0; i < _totalOwned; i++){
        const _tokenOwned = await press.methods.tokenOfOwnerByIndex(_acct, i).call();
        _tokenList.push(_tokenOwned);
      }
    }
    const _managedList = [];
    let ii;
    for (ii=0; ii < _tokenList.length; ii++) {
      const tokenApproved = await press.methods.getApproved(_tokenList[ii]).call();
      if (_acct == tokenApproved) {
        managedList.push(_tokenList[ii]);
      }
    }
    return _managedList;
  }
}

//**************************************
//**return array of tokens belonging to an address (owner/operator)
export async function returnTokensOwned(press, _acct) {
  const _totalOwned = await press.methods.balanceOf(_acct).call();
  let _tokenList = [];
  if (_totalOwned > 0) {
    let i;
    for (i=0; i < _totalOwned; i++){
      const _tokenOwned = await press.methods.tokenOfOwnerByIndex(_acct, i).call();
      _tokenList.push(_tokenOwned);
    }
  }
  return _tokenList;
}

//**************************************
//**generates token list for dropdown menu
export async function returnTokenChoices(press) {
  const _fullList = await press.methods.getTokenList().call();
  const _tokenChoices = [];
  let i;
  for(i = 1; i <= _fullList.length; i++) {
    function _fill(key, text, value) {
      this.key = key;
      this.text = text;
      this.value = value;
    }
    const _title = await press.methods.getTitle(i).call();
    const _item = i + ' - ' +  _title;
    const tokenChoice = new _fill(i, _item, i);
    _tokenChoices.push(tokenChoice);
  };
  return _tokenChoices;
}
