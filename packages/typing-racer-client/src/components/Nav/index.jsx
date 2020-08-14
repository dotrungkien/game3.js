import React, { useContext, useState, useEffect } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { getChain } from "evm-chains";
import NavBar from "./navbar";
import { AppDispatchContext, AppStateContext } from "../App/AppStateProvider";

const Nav = () => {
  const state = useContext(AppStateContext);
  const dispatch = useContext(AppDispatchContext);

  const [network, setNetwork] = useState("N/A");
  const [account, setAccount] = useState("0x");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const web3Modal = new Web3Modal({
      cacheProvider: false, // optional
      providerOptions: {}, // required
    });

    const fetchAccountData = async (provider) => {
      const web3 = new Web3(provider);

      const chainId = await web3.eth.getChainId();
      // console.log({ chainId });
      const chainData = await getChain(chainId);
      setNetwork(chainData.name);
      dispatch({ type: "UPDATE_NETWORK", payload: chainData.name });
      const accounts = await web3.eth.getAccounts();
      const selectedAccount = accounts[0];
      // console.log({ selectedAccount });
      setAccount(selectedAccount);
      dispatch({ type: "UPDATE_ACCOUNT", payload: selectedAccount });

      let balance = parseFloat(
        web3.utils.fromWei(await web3.eth.getBalance(selectedAccount))
      );
      balance = Math.round((balance + Number.EPSILON) * 100) / 100;
      // console.log({ balance });
      setBalance(balance);
      dispatch({ type: "UPDATE_BALANCE", payload: balance });
    };

    const web3Connect = async (web3Modal) => {
      // console.log('Opening a dialog', web3Modal);
      let provider;
      try {
        provider = await web3Modal.connect();
      } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
      }
      // provider.on("accountsChanged", (accounts) => {
      //   fetchAccountData(provider);
      // });
      // provider.on("chainChanged", (chainId) => {
      //   fetchAccountData(provider);
      // });
      // provider.on("networkChanged", (networkId) => {
      //   fetchAccountData(provider);
      // });
      await fetchAccountData(provider);
    };

    setInterval(() => {
      web3Connect(web3Modal);
    }, 1000);
    return () => clearInterval();
  }, [network, account, balance]);

  return (
    <NavBar
      network={state.network}
      account={state.account}
      balance={state.balance}
    />
  );
};

export default Nav;
