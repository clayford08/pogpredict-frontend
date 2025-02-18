import {
  BigInt,
  BigDecimal,
  Bytes,
  Address,
  ethereum
} from "@graphprotocol/graph-ts"
import {
  PogPredict,
  OptionBought,
  UserWon,
  UserLost,
  WinningsClaimed,
  MarketCreated,
  MarketResolved
} from "../generated/PogPredict/PogPredict"
import { User, Market, Bet, MonthlyStat, GlobalStat, PriceSnapshot } from "../generated/schema"

function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (!user) {
    user = new User(address.toHexString())
    user.totalBets = BigInt.fromI32(0)
    user.wins = BigInt.fromI32(0)
    user.losses = BigInt.fromI32(0)
    user.totalWinnings = BigInt.fromI32(0)
    user.totalLost = BigInt.fromI32(0)
    user.totalStaked = BigInt.fromI32(0)
    user.lastActiveTimestamp = BigInt.fromI32(0)
    user.currentStreak = BigInt.fromI32(0)
    user.bestStreak = BigInt.fromI32(0)
    user.largestWin = BigInt.fromI32(0)
    user.largestLoss = BigInt.fromI32(0)
    user.totalROI = BigDecimal.fromString("0")
    user.save()

    let global = getOrCreateGlobalStats()
    global.totalUsers = global.totalUsers.plus(BigInt.fromI32(1))
    global.save()
  }
  return user
}

function getOrCreateGlobalStats(): GlobalStat {
  let global = GlobalStat.load("global")
  if (!global) {
    global = new GlobalStat("global")
    global.totalUsers = BigInt.fromI32(0)
    global.totalMarkets = BigInt.fromI32(0)
    global.totalBets = BigInt.fromI32(0)
    global.totalVolumeStaked = BigInt.fromI32(0)
    global.totalWinnings = BigInt.fromI32(0)
    global.averageROI = BigDecimal.fromString("0")
    global.lastUpdateTimestamp = BigInt.fromI32(0)
    global.save()
  }
  return global
}

function getOrCreateMonthlyStat(user: User, timestamp: BigInt): MonthlyStat {
  let date = new Date(timestamp.toI32() * 1000)
  let yearMonth = date.getUTCFullYear().toString() + "-" + 
                 (date.getUTCMonth() + 1).toString().padStart(2, "0")
  let id = user.id + "-" + yearMonth
  
  let monthlyStat = MonthlyStat.load(id)
  if (!monthlyStat) {
    monthlyStat = new MonthlyStat(id)
    monthlyStat.user = user.id
    monthlyStat.yearMonth = yearMonth
    monthlyStat.wins = BigInt.fromI32(0)
    monthlyStat.losses = BigInt.fromI32(0)
    monthlyStat.winnings = BigInt.fromI32(0)
    monthlyStat.staked = BigInt.fromI32(0)
    monthlyStat.optionACount = BigInt.fromI32(0)
    monthlyStat.optionBCount = BigInt.fromI32(0)
    monthlyStat.save()
  }
  return monthlyStat
}

function createPriceSnapshot(
  marketId: string,
  timestamp: BigInt,
  poolA: BigInt,
  poolB: BigInt,
  blockNumber: BigInt
): void {
  let market = Market.load(marketId)
  if (!market) return

  let snapshotId = marketId + "-" + timestamp.toString()
  let snapshot = new PriceSnapshot(snapshotId)
  snapshot.market = marketId
  snapshot.timestamp = timestamp
  snapshot.totalPoolA = poolA
  snapshot.totalPoolB = poolB
  snapshot.blockNumber = blockNumber

  // Calculate prices (probability)
  let totalPool = poolA.plus(poolB)
  if (totalPool.gt(BigInt.fromI32(0))) {
    snapshot.priceA = poolA.toBigDecimal()
      .times(BigDecimal.fromString("100"))
      .div(totalPool.toBigDecimal())
    snapshot.priceB = poolB.toBigDecimal()
      .times(BigDecimal.fromString("100"))
      .div(totalPool.toBigDecimal())
  } else {
    snapshot.priceA = BigDecimal.fromString("50")
    snapshot.priceB = BigDecimal.fromString("50")
  }

  snapshot.save()

  // Update current prices in market
  market.currentPriceA = snapshot.priceA
  market.currentPriceB = snapshot.priceB
  market.totalPoolA = poolA
  market.totalPoolB = poolB
  market.save()
}

export function handleOptionBought(event: OptionBought): void {
  let user = getOrCreateUser(event.params.user)
  let market = Market.load(event.params.marketId.toString())
  if (!market) return

  // Update user stats
  user.totalBets = user.totalBets.plus(BigInt.fromI32(1))
  user.totalStaked = user.totalStaked.plus(event.params.amount)
  user.lastActiveTimestamp = event.params.timestamp
  user.save()

  // Update market pools and create price snapshot
  let newPoolA = market.totalPoolA
  let newPoolB = market.totalPoolB
  if (event.params.isOptionA) {
    newPoolA = newPoolA.plus(event.params.amount)
  } else {
    newPoolB = newPoolB.plus(event.params.amount)
  }
  
  createPriceSnapshot(
    event.params.marketId.toString(),
    event.params.timestamp,
    newPoolA,
    newPoolB,
    event.block.number
  )

  // Create bet
  let betId = event.params.marketId.toString() + "-" + event.params.user.toHexString()
  let bet = new Bet(betId)
  bet.user = user.id
  bet.market = market.id
  bet.isOptionA = event.params.isOptionA
  bet.amount = event.params.amount
  bet.timestamp = event.params.timestamp
  bet.claimed = false
  bet.save()

  // Update monthly stats
  let monthlyStat = getOrCreateMonthlyStat(user, event.params.timestamp)
  monthlyStat.staked = monthlyStat.staked.plus(event.params.amount)
  if (event.params.isOptionA) {
    monthlyStat.optionACount = monthlyStat.optionACount.plus(BigInt.fromI32(1))
  } else {
    monthlyStat.optionBCount = monthlyStat.optionBCount.plus(BigInt.fromI32(1))
  }
  monthlyStat.save()

  // Update global stats
  let global = getOrCreateGlobalStats()
  global.totalBets = global.totalBets.plus(BigInt.fromI32(1))
  global.totalVolumeStaked = global.totalVolumeStaked.plus(event.params.amount)
  global.lastUpdateTimestamp = event.block.timestamp
  global.save()
}

export function handleUserWon(event: UserWon): void {
  let user = getOrCreateUser(event.params.user)
  let betId = event.params.marketId.toString() + "-" + event.params.user.toHexString()
  let bet = Bet.load(betId)
  if (!bet) return

  // Update user stats
  user.wins = user.wins.plus(BigInt.fromI32(1))
  user.totalWinnings = user.totalWinnings.plus(event.params.amount)
  user.currentStreak = user.currentStreak.plus(BigInt.fromI32(1))
  if (user.currentStreak.gt(user.bestStreak)) {
    user.bestStreak = user.currentStreak
  }
  if (event.params.amount.gt(user.largestWin)) {
    user.largestWin = event.params.amount
  }
  
  // Calculate ROI
  if (user.totalStaked.gt(BigInt.fromI32(0))) {
    let netProfit = user.totalWinnings.minus(user.totalLost)
    user.totalROI = netProfit.toBigDecimal()
      .times(BigDecimal.fromString("10000"))
      .div(user.totalStaked.toBigDecimal())
      .div(BigDecimal.fromString("100"))
  }
  user.save()

  // Update bet
  bet.outcome = 1
  bet.save()

  // Update monthly stats
  let monthlyStat = getOrCreateMonthlyStat(user, event.block.timestamp)
  monthlyStat.wins = monthlyStat.wins.plus(BigInt.fromI32(1))
  monthlyStat.winnings = monthlyStat.winnings.plus(event.params.amount)
  monthlyStat.save()

  // Update global stats
  let global = getOrCreateGlobalStats()
  global.totalWinnings = global.totalWinnings.plus(event.params.amount)
  global.lastUpdateTimestamp = event.block.timestamp
  global.save()
}

export function handleUserLost(event: UserLost): void {
  let user = getOrCreateUser(event.params.user)
  let betId = event.params.marketId.toString() + "-" + event.params.user.toHexString()
  let bet = Bet.load(betId)
  if (!bet) return

  // Update user stats
  user.losses = user.losses.plus(BigInt.fromI32(1))
  user.totalLost = user.totalLost.plus(event.params.amount)
  user.currentStreak = BigInt.fromI32(0) // Reset streak on loss
  if (event.params.amount.gt(user.largestLoss)) {
    user.largestLoss = event.params.amount
  }
  
  // Calculate ROI
  if (user.totalStaked.gt(BigInt.fromI32(0))) {
    let netProfit = user.totalWinnings.minus(user.totalLost)
    user.totalROI = netProfit.toBigDecimal()
      .times(BigDecimal.fromString("10000"))
      .div(user.totalStaked.toBigDecimal())
      .div(BigDecimal.fromString("100"))
  }
  user.save()

  // Update bet
  bet.outcome = 2
  bet.save()

  // Update monthly stats
  let monthlyStat = getOrCreateMonthlyStat(user, event.block.timestamp)
  monthlyStat.losses = monthlyStat.losses.plus(BigInt.fromI32(1))
  monthlyStat.save()
}

export function handleWinningsClaimed(event: WinningsClaimed): void {
  let betId = event.params.marketId.toString() + "-" + event.params.user.toHexString()
  let bet = Bet.load(betId)
  if (!bet) return

  bet.claimed = true
  bet.winnings = event.params.payout
  bet.save()
}

export function handleMarketCreated(event: MarketCreated): void {
  let market = new Market(event.params.marketId.toString())
  let creator = getOrCreateUser(event.transaction.from)

  market.creator = creator.id
  market.question = event.params.question
  market.optionA = event.params.optionA
  market.optionB = event.params.optionB
  market.category = event.params.category
  market.logoUrlA = event.params.logoUrlA
  market.logoUrlB = event.params.logoUrlB
  market.endTime = event.params.endTime
  market.oracleMatchId = event.params.oracleMatchId
  market.totalPoolA = BigInt.fromI32(0)
  market.totalPoolB = BigInt.fromI32(0)
  market.currentPriceA = BigDecimal.fromString("50")
  market.currentPriceB = BigDecimal.fromString("50")
  market.createdAt = event.block.timestamp
  market.save()

  // Create initial price snapshot
  createPriceSnapshot(
    event.params.marketId.toString(),
    event.block.timestamp,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    event.block.number
  )

  // Update global stats
  let global = getOrCreateGlobalStats()
  global.totalMarkets = global.totalMarkets.plus(BigInt.fromI32(1))
  global.lastUpdateTimestamp = event.block.timestamp
  global.save()
}

export function handleMarketResolved(event: MarketResolved): void {
  let market = Market.load(event.params.marketId.toString())
  if (!market) return

  market.outcome = event.params.outcome.toI32()
  market.resolvedBy = event.params.resolvedBy
  market.resolutionDetails = event.params.details
  market.resolutionTimestamp = event.block.timestamp
  market.save()
} 