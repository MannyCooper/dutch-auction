import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { ChangeEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import { Provider } from "../utils/provider";
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";

function getErrorMessage(error: Error): string {
  let errorMessage: string;

  switch (error.constructor) {
    case NoEthereumProviderError:
      errorMessage =
        "No Ethereum browser extension detected. Please install MetaMask extension.";
      break;
    case UnsupportedChainIdError:
      errorMessage = "You're connected to an unsupported network.";
      break;
    case UserRejectedRequestError:
      errorMessage =
        "Please authorize this website to access your Ethereum account.";
      break;
    default:
      errorMessage = error.message;
  }

  return errorMessage;
}

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export function LookUpContract(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, error } = context;
  const [reservePriceLookUp, setReservePriceLookUp] = useState<number>();
  const [priceDecrementLookUp, setPriceDecrementLookUp] = useState<number>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [currentPriceLookUp, setCurrentPrice] = useState<number>();
  const [winner, setWinner] = useState<string>("");

  const handleContractAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(event.target.value);
  };

  const handleGetInfo = async () => {
    const basicDutchAuction = new ethers.Contract(
      contractAddress,
      BasicDutchAuctionArtifact.abi,
      library
    );
    const reservePriceLookUp = await basicDutchAuction.reservePrice();
    const priceDecrementLookUp = await basicDutchAuction.offerPriceDecrement();
    const currentPrice = await basicDutchAuction.currentPrice();
    const winner = await basicDutchAuction.winner();
    setReservePriceLookUp(reservePriceLookUp.toNumber());
    setPriceDecrementLookUp(priceDecrementLookUp.toNumber());
    setCurrentPrice(currentPrice.toNumber());
    setWinner(winner);
  };

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

  return (
    <>
      <h1>Look Up Contract Info: </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridGap: "1rem",
        }}
      >
        <label>Deployed contract address: </label>
        <input
          onChange={handleContractAddressChange}
          type="text"
          value={contractAddress}
        />
        <span>
          <StyledButton onClick={handleGetInfo}> Show Info</StyledButton>
        </span>
      </div>
      <h3>Auction Info: </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridGap: "1rem",
        }}
      >
        <label> Winner: </label>
        <input type="text" value={winner} readOnly />
        <label> Current Price: </label>
        <input type="text" value={currentPriceLookUp} readOnly />
        <label> Reserve Price: </label>
        <input type="text" value={reservePriceLookUp} readOnly />
        <label> Price Decrement: </label>
        <input type="text" value={priceDecrementLookUp} readOnly />
      </div>
    </>
  );
}
