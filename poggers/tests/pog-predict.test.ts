import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ContractSettingUpdated } from "../generated/schema"
import { ContractSettingUpdated as ContractSettingUpdatedEvent } from "../generated/PogPredict/PogPredict"
import { handleContractSettingUpdated } from "../src/pog-predict"
import { createContractSettingUpdatedEvent } from "./pog-predict-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let setting = "Example string value"
    let oldValue = BigInt.fromI32(234)
    let newValue = BigInt.fromI32(234)
    let newContractSettingUpdatedEvent = createContractSettingUpdatedEvent(
      setting,
      oldValue,
      newValue
    )
    handleContractSettingUpdated(newContractSettingUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ContractSettingUpdated created and stored", () => {
    assert.entityCount("ContractSettingUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ContractSettingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "setting",
      "Example string value"
    )
    assert.fieldEquals(
      "ContractSettingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oldValue",
      "234"
    )
    assert.fieldEquals(
      "ContractSettingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newValue",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
