import { AVALANCHE_TESTNET, CONTRACT_ADDRESSES } from './networks';
import PogPredictArtifact from '../../artifacts/contracts/PogPredict.sol/PogPredict.json';
import CS2OracleArtifact from '../../artifacts/contracts/PogPredict.sol/ICS2Oracle.json';
import ReferralArtifact from '../../artifacts/contracts/Referral.sol/Referral.json';

export const config = {
  network: AVALANCHE_TESTNET,
  contracts: {
    PogPredict: {
      address: CONTRACT_ADDRESSES.PogPredict,
      abi: PogPredictArtifact.abi
    },
    CS2Oracle: {
      address: CONTRACT_ADDRESSES.CS2Oracle,
      abi: CS2OracleArtifact.abi
    },
    Referral: {
      address: CONTRACT_ADDRESSES.Referral,
      abi: ReferralArtifact.abi
    }
  }
}; 