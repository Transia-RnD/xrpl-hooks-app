import { Client } from '@transia/xrpl'

const client = new Client(`wss://hooks-testnet-v3.xrpl-labs.com`)

async function connectClient(): Promise<Client> {
  // console.log('\nclient connecting...')
  await client.connect()
  client.networkID = await client.getNetworkID()
  // console.log('client connected!\n')
  return client
}

async function disconnectClient() {
  // console.log('\nclient disconnecting...')
  await client.disconnect()
  // console.log('client connected!')
}

export { client, connectClient, disconnectClient }
