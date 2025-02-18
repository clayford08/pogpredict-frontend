import {
  ContractSettingUpdated as ContractSettingUpdatedEvent,
  FeeRecipientChanged as FeeRecipientChangedEvent,
  ManualResolutionToggled as ManualResolutionToggledEvent,
  MarketCreated as MarketCreatedEvent,
  MarketRefunded as MarketRefundedEvent,
  MarketResolved as MarketResolvedEvent,
  OptionBought as OptionBoughtEvent,
  OptionSold as OptionSoldEvent,
  OracleUpdaterChanged as OracleUpdaterChangedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  PositionLost as PositionLostEvent,
  PositionWon as PositionWonEvent,
  ReferralFeeDistributed as ReferralFeeDistributedEvent,
  RefundClaimed as RefundClaimedEvent,
  Unpaused as UnpausedEvent,
  UserLost as UserLostEvent,
  UserWon as UserWonEvent,
  WinningsClaimed as WinningsClaimedEvent
} from "../generated/PogPredict/PogPredict"
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
} from "../generated/schema"

export function handleContractSettingUpdated(
  event: ContractSettingUpdatedEvent
): void {
  let entity = new ContractSettingUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.setting = event.params.setting
  entity.oldValue = event.params.oldValue
  entity.newValue = event.params.newValue

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeRecipientChanged(
  event: FeeRecipientChangedEvent
): void {
  let entity = new FeeRecipientChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldRecipient = event.params.oldRecipient
  entity.newRecipient = event.params.newRecipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleManualResolutionToggled(
  event: ManualResolutionToggledEvent
): void {
  let entity = new ManualResolutionToggled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.enabled = event.params.enabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let entity = new MarketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.question = event.params.question
  entity.optionA = event.params.optionA
  entity.optionB = event.params.optionB
  entity.category = event.params.category
  entity.logoUrlA = event.params.logoUrlA
  entity.logoUrlB = event.params.logoUrlB
  entity.endTime = event.params.endTime
  entity.oracleMatchId = event.params.oracleMatchId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketRefunded(event: MarketRefundedEvent): void {
  let entity = new MarketRefunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.reason = event.params.reason
  entity.resolvedBy = event.params.resolvedBy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let entity = new MarketResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.outcome = event.params.outcome
  entity.source = event.params.source
  entity.details = event.params.details
  entity.resolvedBy = event.params.resolvedBy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOptionBought(event: OptionBoughtEvent): void {
  let entity = new OptionBought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.isOptionA = event.params.isOptionA
  entity.amount = event.params.amount
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOptionSold(event: OptionSoldEvent): void {
  let entity = new OptionSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.isOptionA = event.params.isOptionA
  entity.amount = event.params.amount
  entity.payout = event.params.payout
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOracleUpdaterChanged(
  event: OracleUpdaterChangedEvent
): void {
  let entity = new OracleUpdaterChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldUpdater = event.params.oldUpdater
  entity.newUpdater = event.params.newUpdater

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionLost(event: PositionLostEvent): void {
  let entity = new PositionLost(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionWon(event: PositionWonEvent): void {
  let entity = new PositionWon(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferralFeeDistributed(
  event: ReferralFeeDistributedEvent
): void {
  let entity = new ReferralFeeDistributed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.referrer = event.params.referrer
  entity.amount = event.params.amount
  entity.marketId = event.params.marketId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRefundClaimed(event: RefundClaimedEvent): void {
  let entity = new RefundClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserLost(event: UserLostEvent): void {
  let entity = new UserLost(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserWon(event: UserWonEvent): void {
  let entity = new UserWon(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWinningsClaimed(event: WinningsClaimedEvent): void {
  let entity = new WinningsClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.marketId = event.params.marketId
  entity.payout = event.params.payout
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
