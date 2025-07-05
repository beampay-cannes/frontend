import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  DataEmitted as DataEmittedEvent,
} from "../generated/SimpleEventContract/SimpleEventContract"
import { DataEvent } from "../generated/schema"

export function handleDataEmitted(event: DataEmittedEvent): void {
  let entity = new DataEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  
  entity.data = event.params.data
  entity.orderId = BigInt.fromUnsignedBytes(event.params.data as Bytes)
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.contractAddress = event.address

  entity.save()
} 