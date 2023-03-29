import fs from 'fs'
import path from 'path'
import {
  Wallet,
  calculateHookOn,
  TTS,
  hexNamespace,
  hexHookParameters,
  SetHook,
  TransactionMetadata,
} from '@transia/xrpl'
import { Hook } from '@transia/xrpl/dist/npm/models/common'
import { prepareTransactionV3 } from './util/transaction'
import { client, connectClient, disconnectClient } from './util/xrplClient'
// import { waitForResult } from '@transia/xrpl-helpers/dist/npm/src/tools'

const hsfOVERRIDE = 1

async function setHook(wallet: Wallet, hooks: Hook[]) {
  await connectClient()
  // Prepare Hook
  const tx: SetHook = {
    Account: wallet.classicAddress,
    TransactionType: 'SetHook',
    Hooks: hooks,
  }

  await prepareTransactionV3(tx)

  console.log(`1. Transaction to submit (before autofill):`)
  console.log(JSON.stringify(tx, null, 2))
  console.log(`\n2. Submitting transaction...`)

  // Autofill Tx
  const preparedTx = await client.autofill(tx)

  // Sign Tx
  const signedTx = wallet.sign(preparedTx).tx_blob

  // Submit Tx
  const response = await client.submitAndWait(signedTx)

  console.log(`\n3. Transaction response:`)
  console.log(response)

  const txResult = (response.result.meta as unknown as TransactionMetadata)
    .TransactionResult
  if (txResult === 'tesSUCCESS') {
    console.log(`\n4. SetHook transaction succeeded!`)
  } else {
    console.log(`\n4. SetHook transaction failed with ${txResult}!`)
  }
  await disconnectClient()
}

async function run() {
  // await connectClient()
  // const files = ['main.c.wasm']

  // SETUP ACCOUNT
  // ---------------------------------------------------------------------
  const wallet: Wallet = Wallet.fromSeed('snoPBrXtMeMyMHUVTgbuqAfg1SUTb')

  // SETUP BINARY
  // ---------------------------------------------------------------------
  const binary = fs.readFileSync(
    path.resolve(__dirname, `../build/${'main.c'}.wasm`)
  )

  // SETUP HOOKON
  // ---------------------------------------------------------------------
  const invokeOn: Array<keyof TTS> = ['Invoke']
  const hookOn = calculateHookOn(invokeOn)

  // SETUP NAMESPACE
  // ---------------------------------------------------------------------
  const hookNamespace = await hexNamespace('starter')

  // SETUP PARAMETERS
  // ---------------------------------------------------------------------
  const parameters = [
    {
      HookParameter: {
        HookParameterName: 'name1',
        HookParameterValue: 'value1',
      },
    },
  ]
  const hookParameters = hexHookParameters(parameters)

  // SETUP GRANTS
  // ---------------------------------------------------------------------

  // BUILD HOOK
  // ---------------------------------------------------------------------
  const hook = {
    Hook: {
      CreateCode: binary.toString(`hex`).toUpperCase(),
      HookOn: hookOn,
      Flags: hsfOVERRIDE,
      HookApiVersion: 0,
      HookNamespace: hookNamespace,
      HookParameters: hookParameters,
    },
  } as unknown as Hook
  setHook(wallet, [hook])

  // switch (files) {
  //   case "main.c.wasm":
  //     break;

  //   default:
  //     break;
  // }
  // await disconnectClient()
}

run()
