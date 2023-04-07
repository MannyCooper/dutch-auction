import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { MouseEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import { injected } from "../utils/connectors";
import { useEagerConnect, useInactiveListener } from "../utils/hooks";
import { Provider } from "../utils/provider";

type ActivateFunction = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean
) => Promise<void>;

function getErrorMessage(error: Error): string {
  let errorMessage: string;

  switch (error.constructor) {
    case NoEthereumProviderError:
      errorMessage = `No Ethereum browser extension detected. Please install MetaMask extension.`;
      break;
    case UnsupportedChainIdError:
      errorMessage = `You're connected to an unsupported network.`;
      break;
    case UserRejectedRequestError:
      errorMessage = `Please authorize this website to access your Ethereum account.`;
      break;
    default:
      errorMessage = error.message;
  }

  return errorMessage;
}

const StyledActivateDeactivateDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  cursor: pointer;
`;

function Activate(): ReactElement {
  const context = useWeb3React<Provider>();
  const { activate, active } = context;

  const [activating, setActivating] = useState<boolean>(false);

  async function handleActivate(
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    event.preventDefault();

    setActivating(true);
    await activate(injected);
    setActivating(false);
  }

  useEagerConnect();
  useInactiveListener(!active);

  return (
    <StyledButton
      disabled={active}
      style={{
        cursor: active ? "not-allowed" : "pointer",
        borderColor: activating ? "orange" : active ? "unset" : "green",
      }}
      onClick={handleActivate}
    >
      Connect
    </StyledButton>
  );
}

function Deactivate(): ReactElement {
  const context = useWeb3React<Provider>();
  const { deactivate, active } = context;

  function handleDeactivate(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    deactivate();
  }

  return (
    <StyledButton
      disabled={!active}
      style={{
        cursor: active ? "pointer" : "not-allowed",
        borderColor: active ? "red" : "unset",
      }}
      onClick={handleDeactivate}
    >
      Disconnect
    </StyledButton>
  );
}

export function WalletConnection(): ReactElement {
  const context = useWeb3React<Provider>();
  const { error } = context;

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

  return (
    <StyledActivateDeactivateDiv>
      <>
        <h1>Wallet Connection: </h1>
      </>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: "1rem",
        }}
      >
        <Activate />
        <Deactivate />
      </div>
    </StyledActivateDeactivateDiv>
  );
}
