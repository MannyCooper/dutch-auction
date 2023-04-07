import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { ChangeEvent, ReactElement, useState } from "react";
import { Provider } from "../utils/provider";
import styled from "styled-components";
import { ethers } from "ethers";
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const getErrorMessage = (error: Error): string => {
  switch (error.constructor) {
    case NoEthereumProviderError:
      return "No Ethereum browser extension detected. Please install MetaMask extension.";
    case UnsupportedChainIdError:
      return "You're connected to an unsupported network.";
    case UserRejectedRequestError:
      return "Please authorize this website to access your Ethereum account.";
    default:
      return error.message;
  }
};

const Bid = (): ReactElement => {
  const { error, library } = useWeb3React<Provider>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<number>(0);

  const handleBid = async () => {
    if (!library || !contractAddress || !bidAmount) {
      window.alert(
        "Please connect to a wallet, then enter a contract address and bid amount"
      );
      return;
    }

    const basicDutchAuction = new ethers.Contract(
      contractAddress,
      BasicDutchAuctionArtifact.abi,
      library.getSigner()
    );
    const [info, currentPrice] = await Promise.all([
      basicDutchAuction.getInfo(),
      basicDutchAuction.currentPrice(),
    ]);
    if (bidAmount < currentPrice) {
      window.alert(
        "Bid failed! Your bid must be greater than the current price!"
      );
      return;
    }
    try {
      const bid = await basicDutchAuction.bid({
        value: ethers.BigNumber.from(bidAmount),
      });
      await bid.wait();
      if (bid) {
        window.alert("Bid successful");
        const winner1 = await basicDutchAuction.winner();
        setWinner(winner1);
      }
    } catch (e: any) {
      window.alert("Bid failed");
    }
  };

  if (error) {
    window.alert(getErrorMessage(error));
  }

  const handleContractAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(event.target.value);
  };

  const handleBidAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(event.target.value));
  };

  return (
    <>
      <h1>Submit a bid: </h1>
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
        <label> Bid Amount </label>
        <input
          type="number"
          min="0"
          onChange={handleBidAmountChange}
          value={bidAmount}
        />
        <span>
          {" "}
          <StyledButton onClick={handleBid}>Bid</StyledButton>{" "}
        </span>
      </div>
      <h3>Auction Info:</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridGap: "1rem",
        }}
      >
        <label>Winner: </label>
        <input type="text" value={winner} readOnly />
      </div>
    </>
  );
};

export default Bid;
