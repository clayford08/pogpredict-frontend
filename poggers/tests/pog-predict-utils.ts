import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ContractSettingUpdated,
  FeeRecipientChanged,
  ManualResolutionToggled,
  MarketCreated,
  MarketRefunded,
  MarketResolved,
  OptionBought,
  OptionSold,
  OracleUpdaterChanged,
  OwnershipTransferStarted,
  OwnershipTransferred,
  Paused,
  PositionLost,
  PositionWon,
  ReferralFeeDistributed,
  RefundClaimed,
  Unpaused,
  UserLost,
  UserWon,
  WinningsClaimed
} from "../generated/PogPredict/PogPredict"

export function createContractSettingUpdatedEvent(
  setting: string,
  oldValue: BigInt,
  newValue: BigInt
): ContractSettingUpdated {
  let contractSettingUpdatedEvent =
    changetype<ContractSettingUpdated>(newMockEvent())

  contractSettingUpdatedEvent.parameters = new Array()

  contractSettingUpdatedEvent.parameters.push(
    new ethereum.EventParam("setting", ethereum.Value.fromString(setting))
  )
  contractSettingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldValue",
      ethereum.Value.fromUnsignedBigInt(oldValue)
    )
  )
  contractSettingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newValue",
      ethereum.Value.fromUnsignedBigInt(newValue)
    )
  )

  return contractSettingUpdatedEvent
}

export function createFeeRecipientChangedEvent(
  oldRecipient: Address,
  newRecipient: Address
): FeeRecipientChanged {
  let feeRecipientChangedEvent = changetype<FeeRecipientChanged>(newMockEvent())

  feeRecipientChangedEvent.parameters = new Array()

  feeRecipientChangedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRecipient",
      ethereum.Value.fromAddress(oldRecipient)
    )
  )
  feeRecipientChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newRecipient",
      ethereum.Value.fromAddress(newRecipient)
    )
  )

  return feeRecipientChangedEvent
}

export function createManualResolutionToggledEvent(
  enabled: boolean
): ManualResolutionToggled {
  let manualResolutionToggledEvent =
    changetype<ManualResolutionToggled>(newMockEvent())

  manualResolutionToggledEvent.parameters = new Array()

  manualResolutionToggledEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return manualResolutionToggledEvent
}

export function createMarketCreatedEvent(
  marketId: BigInt,
  question: string,
  optionA: string,
  optionB: string,
  category: string,
  logoUrlA: string,
  logoUrlB: string,
  endTime: BigInt,
  oracleMatchId: BigInt
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("optionA", ethereum.Value.fromString(optionA))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("optionB", ethereum.Value.fromString(optionB))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("category", ethereum.Value.fromString(category))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("logoUrlA", ethereum.Value.fromString(logoUrlA))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("logoUrlB", ethereum.Value.fromString(logoUrlB))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "oracleMatchId",
      ethereum.Value.fromUnsignedBigInt(oracleMatchId)
    )
  )

  return marketCreatedEvent
}

export function createMarketRefundedEvent(
  marketId: BigInt,
  reason: string,
  resolvedBy: Address
): MarketRefunded {
  let marketRefundedEvent = changetype<MarketRefunded>(newMockEvent())

  marketRefundedEvent.parameters = new Array()

  marketRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  marketRefundedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )
  marketRefundedEvent.parameters.push(
    new ethereum.EventParam(
      "resolvedBy",
      ethereum.Value.fromAddress(resolvedBy)
    )
  )

  return marketRefundedEvent
}

export function createMarketResolvedEvent(
  marketId: BigInt,
  outcome: i32,
  source: i32,
  details: string,
  resolvedBy: Address
): MarketResolved {
  let marketResolvedEvent = changetype<MarketResolved>(newMockEvent())

  marketResolvedEvent.parameters = new Array()

  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "outcome",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(outcome))
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "source",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(source))
    )
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam("details", ethereum.Value.fromString(details))
  )
  marketResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "resolvedBy",
      ethereum.Value.fromAddress(resolvedBy)
    )
  )

  return marketResolvedEvent
}

export function createOptionBoughtEvent(
  user: Address,
  marketId: BigInt,
  isOptionA: boolean,
  amount: BigInt,
  timestamp: BigInt
): OptionBought {
  let optionBoughtEvent = changetype<OptionBought>(newMockEvent())

  optionBoughtEvent.parameters = new Array()

  optionBoughtEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  optionBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  optionBoughtEvent.parameters.push(
    new ethereum.EventParam("isOptionA", ethereum.Value.fromBoolean(isOptionA))
  )
  optionBoughtEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  optionBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return optionBoughtEvent
}

export function createOptionSoldEvent(
  user: Address,
  marketId: BigInt,
  isOptionA: boolean,
  amount: BigInt,
  payout: BigInt,
  timestamp: BigInt
): OptionSold {
  let optionSoldEvent = changetype<OptionSold>(newMockEvent())

  optionSoldEvent.parameters = new Array()

  optionSoldEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  optionSoldEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  optionSoldEvent.parameters.push(
    new ethereum.EventParam("isOptionA", ethereum.Value.fromBoolean(isOptionA))
  )
  optionSoldEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  optionSoldEvent.parameters.push(
    new ethereum.EventParam("payout", ethereum.Value.fromUnsignedBigInt(payout))
  )
  optionSoldEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return optionSoldEvent
}

export function createOracleUpdaterChangedEvent(
  oldUpdater: Address,
  newUpdater: Address
): OracleUpdaterChanged {
  let oracleUpdaterChangedEvent =
    changetype<OracleUpdaterChanged>(newMockEvent())

  oracleUpdaterChangedEvent.parameters = new Array()

  oracleUpdaterChangedEvent.parameters.push(
    new ethereum.EventParam(
      "oldUpdater",
      ethereum.Value.fromAddress(oldUpdater)
    )
  )
  oracleUpdaterChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newUpdater",
      ethereum.Value.fromAddress(newUpdater)
    )
  )

  return oracleUpdaterChangedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPositionLostEvent(
  user: Address,
  marketId: BigInt,
  amount: BigInt
): PositionLost {
  let positionLostEvent = changetype<PositionLost>(newMockEvent())

  positionLostEvent.parameters = new Array()

  positionLostEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  positionLostEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  positionLostEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return positionLostEvent
}

export function createPositionWonEvent(
  user: Address,
  marketId: BigInt,
  amount: BigInt
): PositionWon {
  let positionWonEvent = changetype<PositionWon>(newMockEvent())

  positionWonEvent.parameters = new Array()

  positionWonEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  positionWonEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  positionWonEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return positionWonEvent
}

export function createReferralFeeDistributedEvent(
  user: Address,
  referrer: Address,
  amount: BigInt,
  marketId: BigInt
): ReferralFeeDistributed {
  let referralFeeDistributedEvent =
    changetype<ReferralFeeDistributed>(newMockEvent())

  referralFeeDistributedEvent.parameters = new Array()

  referralFeeDistributedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  referralFeeDistributedEvent.parameters.push(
    new ethereum.EventParam("referrer", ethereum.Value.fromAddress(referrer))
  )
  referralFeeDistributedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  referralFeeDistributedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )

  return referralFeeDistributedEvent
}

export function createRefundClaimedEvent(
  marketId: BigInt,
  user: Address,
  amount: BigInt
): RefundClaimed {
  let refundClaimedEvent = changetype<RefundClaimed>(newMockEvent())

  refundClaimedEvent.parameters = new Array()

  refundClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  refundClaimedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  refundClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return refundClaimedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}

export function createUserLostEvent(
  user: Address,
  marketId: BigInt,
  amount: BigInt
): UserLost {
  let userLostEvent = changetype<UserLost>(newMockEvent())

  userLostEvent.parameters = new Array()

  userLostEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userLostEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  userLostEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return userLostEvent
}

export function createUserWonEvent(
  user: Address,
  marketId: BigInt,
  amount: BigInt
): UserWon {
  let userWonEvent = changetype<UserWon>(newMockEvent())

  userWonEvent.parameters = new Array()

  userWonEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userWonEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  userWonEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return userWonEvent
}

export function createWinningsClaimedEvent(
  user: Address,
  marketId: BigInt,
  payout: BigInt,
  timestamp: BigInt
): WinningsClaimed {
  let winningsClaimedEvent = changetype<WinningsClaimed>(newMockEvent())

  winningsClaimedEvent.parameters = new Array()

  winningsClaimedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  winningsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  winningsClaimedEvent.parameters.push(
    new ethereum.EventParam("payout", ethereum.Value.fromUnsignedBigInt(payout))
  )
  winningsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return winningsClaimedEvent
}
