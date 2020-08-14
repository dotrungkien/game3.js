import React from "react";

const NavBar = ({ network, account, balance }) => (
  <nav
    id="connected"
    className="nav nav-pills nav-fill p-2"
    style={{ background: "#e3f2fd" }}
  >
    <img src="favicon.ico" width="40" height="40" alt="" />
    <h4 className="pt-1">Typing Master</h4>
    <p className="nav-item pt-2">
      <strong>Network:</strong>
      <span id="network-name">{network}</span>
    </p>
    <p className="nav-item pt-2">
      <strong>Account:</strong>
      <span id="selected-account">{account}</span>
    </p>
    <p className="nav-item pt-2">
      <strong>Balance:</strong>
      <span id="account-balance">{balance}</span>
    </p>
  </nav>
);

export default NavBar;
