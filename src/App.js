import React, { useState, useEffect } from "react";
import "./styles.css";
import { Magic } from "magic-sdk";
import { PolkadotExtension } from "@magic-ext/polkadot";

const magic = new Magic("pk_test_EDF0307A9991979E", {
  extensions: {
    polkadot: new PolkadotExtension({
      rpcUrl: 'wss://kusama-rpc.polkadot.io/'
    })
  }
});

export default function App() {
  const [email, setEmail] = useState("");
  const [publicAddress, setPublicAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [sendAmount, setSendAmount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMetadata, setUserMetadata] = useState({});
  const [txHash, setTxHash] = useState("");
  const [sendingTransaction, setSendingTransaction] = useState(false);

  useEffect(() => {
    magic.user.isLoggedIn().then(async magicIsLoggedIn => {
      setIsLoggedIn(magicIsLoggedIn);
      if (magicIsLoggedIn) {
        const publicAddress = (await magic.polkadot.getAccount());
        setPublicAddress(publicAddress);
        setUserMetadata(await magic.user.getMetadata());
      }
    });
  }, [isLoggedIn]);

  const login = async () => {
    await magic.auth.loginWithMagicLink({ email });
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await magic.user.logout();
    setIsLoggedIn(false);
  };

  const handlerSendTransaction = async () => {

    setSendingTransaction(true);

    const tx = await magic.polkadot.sendTransaction(
        destinationAddress,
        sendAmount,
    );

    setSendingTransaction(false);

    setTxHash(tx);

    console.log('send transaction', tx)
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="container">
          <h1>Please sign up or login</h1>
          <input
            type="email"
            name="email"
            required="required"
            placeholder="Enter your email"
            onChange={event => {
              setEmail(event.target.value);
            }}
          />
          <button onClick={login}>Send</button>
        </div>
      ) : (
        <div>
          <div className="container">
            <h1>Current user: {userMetadata.email}</h1>
            <button onClick={logout}>Logout</button>
          </div>
          <div className="container">
            <h1>Zilliqa address</h1>
            <div className="info">
              <a
                href={`https://viewblock.io/zilliqa/address/${publicAddress}?network=testnet`}
                target="_blank"
              >
                {publicAddress}
              </a>
            </div>
          </div>
          <div className="container">
            <h1>Send Transaction</h1>
            {txHash ? (
              <div>
                <div>Send transaction success</div>
                <div className="info">
                  <a
                    href={`https://viewblock.io/zilliqa/tx/${txHash}?network=testnet`}
                    target="_blank"
                  >
                    {txHash}
                  </a>
                </div>
              </div>
            ) : sendingTransaction ? (<div className="sending-status">
              Sending transaction
            </div>) : (
              <div />
            )}
            <input
              type="text"
              name="destination"
              className="full-width"
              required="required"
              placeholder="Destination address"
              onChange={event => {
                setDestinationAddress(event.target.value);
              }}
            />
            <input
              type="text"
              name="amount"
              className="full-width"
              required="required"
              placeholder="Amount in Zil"
              onChange={event => {
                setSendAmount(event.target.value);
              }}
            />
            <button id="btn-send-txn" onClick={handlerSendTransaction}>
              Send Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
