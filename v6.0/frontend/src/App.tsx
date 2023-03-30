import { ReactElement } from "react";
import styled from "styled-components";
import { WalletConnection } from "./components/WalletConnection";
import { DeployContract } from "./components/DeployContract";
import { LookUpContract } from "./components/LookUp";
import Bid from "./components/Bid";
import { SectionDivider } from "./components/SectionDivider";
import { WalletStatus } from "./components/WalletStatus";

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 1rem;
  padding: 20px;

  @media (min-width: 768px) {
    grid-gap: 20px;
  }
`;

const Section = ({ children }: { children: ReactElement }) => (
  <>
    {children}
    <SectionDivider />
  </>
);

export function App(): ReactElement {
  return (
    <StyledAppDiv>
      <Section>
        <WalletConnection />
      </Section>
      <Section>
        <WalletStatus />
      </Section>
      <Section>
        <DeployContract />
      </Section>
      <Section>
        <LookUpContract />
      </Section>
      <Bid />
    </StyledAppDiv>
  );
}
