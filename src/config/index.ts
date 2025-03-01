import { BASE_SEPOLIA, contracts as CONTRACT_ADDRESSES } from './contracts';
import PogPredictArtifact from '../../artifacts/contracts/PogPredict.sol/PogPredict.json';
import CS2OracleArtifact from '../../artifacts/contracts/PogPredict.sol/ICS2Oracle.json';
import ReferralArtifact from '../../artifacts/contracts/Referral.sol/Referral.json';

export const config = {
  network: BASE_SEPOLIA,
  contracts: {
    PogPredict: {
      address: CONTRACT_ADDRESSES.PogPredict.address,
      abi: PogPredictArtifact.abi
    },
    CS2Oracle: {
      address: process.env.NEXT_PUBLIC_CS2_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
      abi: CS2OracleArtifact.abi
    },
    Referral: {
      address: CONTRACT_ADDRESSES.Referral.address,
      abi: ReferralArtifact.abi
    }
  }
}; 