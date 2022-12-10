import * as React from "react";
import {
  SwapWidget,
  config,
  Transaction,
  transformTransactions,
  getDefaultTokenList,
  NotLoginError,
  TokenMetadata,
  getPool,
  init_env,
  getConfig,
} from "@ref-finance/ref-sdk";
import { useWalletSelector } from "./WalletSelectorContext";
import "@near-wallet-selector/modal-ui/styles.css";

import { SignAndSendTransactionsParams } from "@near-wallet-selector/core/lib/wallet";
import { useEffect } from "react";
import { REF_WIDGET_NETWORK_ENV_KEY } from "./App";

export const Content = () => {
  const [enableSmartRouting, setEnableSmartRouting] = React.useState(false);

  const { modal, selector, accountId } = useWalletSelector();

  const onDisConnect = async () => {
    const wallet = await selector.wallet();
    return await wallet.signOut();
  };

  const onConnect = () => {
    modal.show();
  };

  const [swapState, setSwapState] = React.useState<"success" | "fail" | null>(null);

  const [tx, setTx] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get("errorCode");

    const transactions = new URLSearchParams(window.location.search).get("transactionHashes");

    const lastTX = transactions?.split(",").pop();

    setTx(lastTX);

    setSwapState(!!errorCode ? "fail" : !!lastTX ? "success" : null);

    window.history.replaceState({}, "", window.location.origin + window.location.pathname);
  }, []);

  const onSwap = async (transactionsRef: Transaction[]) => {
    const wallet = await selector.wallet();

    if (!accountId) throw NotLoginError;

    const WalletSelectorTransactions = {
      transactions: transformTransactions(transactionsRef, accountId),
    } as SignAndSendTransactionsParams;

    return wallet.signAndSendTransactions(WalletSelectorTransactions);
  };

  const defaultList = getDefaultTokenList();

  return (
    <>
      <button
        className="text-white outline ml-2 mt-2"
        onClick={async () => {
          localStorage.setItem(REF_WIDGET_NETWORK_ENV_KEY, getConfig().networkId === "testnet" ? "mainnet" : "testnet");

          // await onDisConnect();

          window.location.reload();
        }}
      >
        Change Network from
        {` ${getConfig().networkId} to ${getConfig().networkId === "testnet" ? "mainnet" : "testnet"}`}
      </button>

      <button
        className="text-white outline ml-2 mt-2"
        onClick={() => {
          setEnableSmartRouting(!enableSmartRouting);
        }}
      >
        Change support ledger from
        {` ${enableSmartRouting} to ${!enableSmartRouting}`}
      </button>

      <SwapWidget
        onSwap={onSwap}
        onDisConnect={onDisConnect}
        width={"500px"}
        connection={{
          AccountId: accountId || "",
          isSignedIn: !!accountId,
        }}
        className="mx-auto"
        transactionState={{
          state: swapState,
          setState: setSwapState,
          tx,
          detail: "(success details show here)",
        }}
        defaultTokenList={defaultList as TokenMetadata[]}
        enableSmartRouting={enableSmartRouting}
        onConnect={onConnect}
      />
    </>
  );
};
