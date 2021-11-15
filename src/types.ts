const block = {
  "hash": "0x8280eece793aaca696f1f5d6998470f74bd476fcc2c15c27cba17582e30c4bef",
  "parentHash": "0x1f83f30154320e0545c6050754b3ccafd6d1e8df5be48718774ce8f5ef173d8d",
  "number": 13564086,
  "timestamp": 1636216453,
  "nonce": "0xda4abf36b6b47f2f",
  "difficulty": null,
  "gasLimit": { "type": "BigNumber", "hex": "0x01c9c380" },
  "gasUsed": { "type": "BigNumber", "hex": "0x873091" },
  "miner": "0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B45836",
  "extraData": "0x486976656f6e2072752d6865617679",
  "transactions": [
    
  ],
  "baseFeePerGas": { "type": "BigNumber", "hex": "0x1418ff6442" }
}

const transaction = {
  "hash": "0xdd612cf5a3a8b7bb5c35b648723d8597205f7d32ca1352fc97f14c93a72ca827",
  "type": 0,
  "accessList": null,
  "blockHash": "0x8280eece793aaca696f1f5d6998470f74bd476fcc2c15c27cba17582e30c4bef",
  "blockNumber": 13564086,
  "transactionIndex": 0,
  "confirmations": 4,
  "from": "0xD344Af8d1273291E6265c19ee838F0A70E288c7d",
  "gasPrice": { "type": "BigNumber", "hex": "0x1d326c2600", "_hex": "0x1d326c2600"},
  "gasLimit": { "type": "BigNumber", "hex": "0x03c164", "_hex": "0x03c164" },
  "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "value": { "type": "BigNumber", "hex": "0x00", "_hex": "0x00" },
  "nonce": 1542,
  "data": "0x38ed1739000000000000000000000000000000000000000000000000000000012a05f200000000000000000000000000000000000000000000000bd872ae836768e4f91f00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000582534236ddcd367e3381de6f5b72bbce8126bfe000000000000000000000000000000000000000000000000000000006186afa30000000000000000000000000000000000000000000000000000000000000003000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000ca7b3ba66556c4da2e2a9afef9c64f909a59430a",
  "r": "0xfe846f5a113d601ccb14229b0360ee115fd6604c7a0af19912773a3e8563863b",
  "s": "0x146745bcd6859936a2ff1a0560e589ab3a891745beed45662ca045356672e286",
  "v": 37,
  "creates": null,
  "chainId": 1,
};

export type EthTransaction = typeof transaction;
type EthB = typeof block;

export interface EthBlock extends Omit<EthB, 'transactions'> {
  transactions: EthTransaction[];
};


export type HumanizedTransactionTypes = {
  erc20: number;
  nft: number;
  transfer: number;
  unrecognized: number;
}

export type HumanizedTransactionTypeName = 'unrecognized' | 'erc20' | 'nft' | 'transfer';

export type HumanizedTransactionValues = {
  value: {
      avgValue: number;
      medianValue: number;
      minValue: number;
      maxValue: number;
      sumValue: number;
  };
  gas: {
      avgGas: number;
      medianGas: number;
      minGas: number;
      maxGas: number;
      sumGas: number;
  };
  data: any[];
}
