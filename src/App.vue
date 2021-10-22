<template>
  <h3 style="text-align: center;">Solana Slot: {{ slot }}</h3>
  <br />

  <div class="container">
    <div class="price-card" v-for="(xs, k) in cards" :key="k">
      <DataTable :value="xs">
        <Column field="v" :header="k"></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup  lang="ts">
import * as web3 from '@solana/web3.js'
import assert from 'assert'
import * as borsh from 'borsh'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { ref, reactive } from 'vue'

const feeds = {
  'AVAX/USD': 'DinfGKkKxJsU3kFnj173zSRdXNhZxxgZY8YC5GCQYhsi',
  'ETH/USD': '8pcXGi4QoHKytv3issKdFF3XRDeYAGEgy6EEAi1ioLe7',
  'SOL/USD': 'FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf',
}

const cards = reactive({
  'AVAX/USD': [],
  'ETH/USD': [],
  'SOL/USD': [],
} as Record<string, any[]>)

const frequency = 1000 / (10 / (Object.entries(feeds).length + 2))

class AggregatorAccount {
  answer: any[] = []
  constructor(fields: { answer: number } | undefined = undefined) {
    if (fields) {
      this.answer = fields.answer as any
    }
  }
}

// Borsh schema definition for greeting accounts
const AggregatorSchema = new Map([
  [AggregatorAccount, { kind: 'struct', fields: [['answer', ['u128', 6400]]] }],
])

const conn = new web3.Connection(web3.clusterApiUrl('devnet'))
const slot = ref(0)

!(async function getSlot() {
  slot.value = await conn.getSlot()
  setTimeout(getSlot, frequency)
})()

!(async function getInfo() {
  for (const [k, addr] of Object.entries(feeds)) {
    const key = new web3.PublicKey(addr)
    const resp = await conn.getAccountInfoAndContext(key)
    assert(resp.value)
    const data = borsh.deserialize(AggregatorSchema, AggregatorAccount, resp.value.data)
    const vs = data.answer.filter((x) => x.length === 2)
    const m = (x: any) => ({ t: 1, v: (x / 1e9).toFixed(4) })
    cards[k] = vs.slice(0, 10).map(m).concat(vs.reverse().slice(0, 10).map(m))
  }
  setTimeout(getInfo, frequency)
})()


</script>

<style lang="scss" scoped>
* {
  font-family: monospace;
}

.container {
  display: flex;
  margin: 0 auto;
  max-width: 1024px;
  gap: 1.5rem;
}

.price-card {
  border-radius: 4px;
  box-shadow: 0 0 16px gray;
  flex: 1;
  text-align: center;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
}

.price-card .p-component {
  font-family: monospace;
}
</style>
