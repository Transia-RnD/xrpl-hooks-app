import { encode } from '@transia/ripple-binary-codec'
import { Transaction } from '@transia/xrpl'
import { getFeeEstimateXrp } from '@transia/xrpl/dist/npm/sugar'

import { client } from './xrplClient'

interface ServerStateRPCResult {
  state: {
    validated_ledger: {
      reserve_base: number // Account Reserve fee
      reserve_inc: number // Owner Reserve fee
    }
  }
}

async function accountReserveFee(): Promise<number> {
  const request = {
    command: 'server_state',
  }
  const { result } = await client.request(request)
  return (result as ServerStateRPCResult).state.validated_ledger?.reserve_base
}

async function ownerReserveFee(): Promise<number> {
  const request = {
    command: 'server_state',
  }
  const { result } = await client.request(request)
  return (result as ServerStateRPCResult).state.validated_ledger?.reserve_inc
}

async function getTransactionFee(transaction: Transaction) {
  const copyTx = { ...transaction }
  copyTx.Fee = `0`
  copyTx.SigningPubKey = ``

  const preparedTx = await client.autofill(copyTx)

  console.log(preparedTx)

  const tx_blob = encode(preparedTx)

  console.log(tx_blob)

  const netFeeXRP = await getFeeEstimateXrp(client, tx_blob)

  return netFeeXRP
}

async function prepareTransactionV3(transaction) {
  transaction.Fee = await getTransactionFee(transaction)
}

export { accountReserveFee, ownerReserveFee, prepareTransactionV3 }
