import { getBlockHumanizedDaytime, getBlockHumanizedSeason } from "./advanced";
import { EthBlock, EthTransaction, HumanizedTransactionTypeName, HumanizedTransactionTypes, HumanizedTransactionValues } from "./types";

/**
 * Dictionary for the humanized transaction type calculation
 */
export const HUMANIZED_TYPES_CONDITIONS = {
    erc20: {
        data: ["a9059cbb", "23b872dd", "18160ddd", "70a08231", "dd62ed3e", "095ea7b3"],
    },
    nft: {
        data: ["1249c58b", "672a9400", "40c10f19", "449a52f8", "a140ae23"],
        to: [
            "0xaa84f7c9164db5c11b9fa65ad0118977c12a4729", // BlockArt storefront
            "0xb80fbf6cdb49c33dc6ae4ca11af8ac47b0b4c0f3", // BlockArt
            "0x495f947276749ce646f68ac8c248420045cb7b5e", // OpenSea Shared
            "0x60f80121c31a0d46b5279700f9df786054aa5ee5", // Rarible
            "0x3b3ee1931dc30c1957379fac9aba94d1c48a5405", // FND
            "0x2a46f2ffd99e19a89476e2f62270e0a35bbf0756", // MakerSpace
            "0xfbeef911dc5821886e1dda71586d90ed28174b7d", // Known Origin
            "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270", // Art Blocks Curated
            "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0", // Super Rare
            "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", // Punks
            "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", // Bored Ape Yacht Club
            "0x06012c8cf97bead5deae237070f9587f8e7a266d", // Kittens
            "0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d", // Axie
        ]
    }
}

const isERC20 = ({ data }: Pick<EthTransaction, 'data'>) => {
    let result = false;
    const ERC20_SIGNS = HUMANIZED_TYPES_CONDITIONS.erc20.data;

    ERC20_SIGNS.forEach((s => {
        if (result) return;
        if (data.toLowerCase().startsWith(`0x${s}`)) {
            result = true;
        }
    }));

    return result;
}

const isNFT = ({ data, to }: Pick<EthTransaction, 'data' | 'to' | 'value'>) => {
    let result = false;
    const NFT_SIGNS = HUMANIZED_TYPES_CONDITIONS.nft.data;
    NFT_SIGNS.forEach((s => {
        if (result) return;
        if ((data).toLowerCase().startsWith(`0x${s}`)) {
            result = true;
        }
    }));
    if (result) return result;

    if (!to) return result;

    const NFT_ART = HUMANIZED_TYPES_CONDITIONS.nft.to;

    NFT_ART.forEach((s => {
        if (result) return;
        if (to.toLowerCase().startsWith(s)) {
            result = true;
        }
    }));

    return result;
}

const isTransfer = ({ value }: Pick<EthTransaction, 'data' | 'to' | 'value'>) => {   
    const vHex = value.hex || value._hex;
    if (vHex && parseInt(vHex, 16) !== 0) return true;
    return false;
}

const ethToValue = (v:any) => parseInt(v, 16) / 1000000000000000000;


/**
 * Get Transaction's humanized type name
 *
 * **Types**: `erc20`, `nft`, `transfer`, `unrecognized`
 */
export function getTransactionHumanizedTypeName(transaction: EthTransaction) {
    let currentType: HumanizedTransactionTypeName = 'unrecognized';
    if (isERC20(transaction)) {
        currentType = 'erc20';
    }
    else if (isNFT(transaction)) {
        currentType = 'nft';
    }
    else if (isTransfer(transaction)) {
        currentType = 'transfer';
    }

    return currentType;
}

/**
 * Get Transactions metadata in humanized view:
 * 
 * `Types`
 * * erc20, nft, transfer, unrecognized
 * 
 * `Value, Gas`
 * * average, minimum, maximum, median, summ value/gas in transactions array
 * 
 * **Example**
 
```
{
    "types": {
        "erc20": 93,
        "nft": 0,
        "transfer": 144,
        "unrecognized": 57
    },
    "values": {
        "value": {
            "avgValue": 0.3343366122304634,
            "minValue": 0,
            "medianValue": 0,
            "maxValue": 21.995,
            "sumValue": 98.29496399575623
        },
        "gas": {
            "avgGas": 0.035442864392160454,
            "medianGas": 0.017042417914345,
            "minGas": 0.0031647,
            "maxGas": 1.2892222294735,
            "sumGas": 10.420202131295174
        },
        "data": [
            {
                "hash": "0xb41984c70cd05687fbc5d721c6bb2c02ee8158201c1749f8bb9645ea5899d7d7",
                "type": "unrecognized",
                "value": 0,
                "gas": 0.07462853334800001
            },
            // ...
        ]
    }
}
```

 */
export function getTransactionsHumanized({ transactions }: Pick<EthBlock, 'transactions'>) {
    const types: HumanizedTransactionTypes = {
        erc20: 0,
        nft: 0,
        transfer: 0,
        unrecognized: 0,
    }
    const values: HumanizedTransactionValues = {
        value: {
            avgValue: 0,
            minValue: 0,
            medianValue: 0,
            maxValue: 0,
            sumValue: 0,
        },
        gas: {
            avgGas: 0,
            medianGas: 0,
            minGas: 0,
            maxGas: 0,
            sumGas: 0,
        },
        data: []
    }
    let dataValue: number[] = [];
    let dataGas: number[] = [];

    transactions?.forEach(transaction => {
        const type = getTransactionHumanizedTypeName(transaction);
        switch (type) {
            case 'erc20':
                types.erc20 += 1;
                break;
            case 'nft':
                types.nft += 1;
                break;
            case 'transfer':
                types.transfer += 1;
                break;
            case 'unrecognized':
            default:
                types.unrecognized += 1;
                break;
        }

        const gp = transaction.gasPrice.hex || transaction.gasPrice._hex;
        const gl = transaction.gasLimit.hex || transaction.gasLimit._hex;
        const gas = ethToValue(gp) * ethToValue(gl)*1000000000000000000;
        const val = ethToValue(transaction.value.hex || transaction.value._hex);
        dataValue.push(val);
        dataGas.push(gas)

        values.data.push({
            hash: transaction.hash,
            type,
            value: val,
            gas,
        });
    });


    const median = (arr: any[]) => {
        const mid = Math.floor(arr.length / 2),
            nums = [...arr].sort((a, b) => a - b);
        return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    const average = (arr: any[]) => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

    values.value.avgValue = average(dataValue);
    values.value.medianValue = median(dataValue);
    values.value.minValue = Math.min(...dataValue);
    values.value.maxValue = Math.max(...dataValue);
    values.value.sumValue = dataValue.reduce((partial_sum, a) => partial_sum + a, 0);

    values.gas.avgGas = average(dataGas);
    values.gas.medianGas = median(dataGas);
    values.gas.minGas = Math.min(...dataGas);
    values.gas.maxGas = Math.max(...dataGas);
    values.gas.sumGas = dataGas.reduce((partial_sum, a) => partial_sum + a, 0);

    return { types, values };
}

/**
 * Get Ethereum block's metadata in humanized view.
 * 
 * **Transaction Types**
 * * erc20, nft, transfer, unrecognized
 * 
 * **Transaction Value, Gas**
 * * `average`, `minimum`, `maximum`, `median`, `summ` `value`/`gas` in transactions array
 * 
 * **Block Season**
 * * `winter`, `sprint`, `summer`, `autumn`
 * 
 * **Daytime**
 * * `night`, `morning`, `day`, `afterday`, `evening` in UTC
 * 
 * **Example result**
 * 
 * ```
{
    "number": 13596479,
    "season": "autumn",
    "daytime": "evening",
    "time": "2021-11-11T18:20:00.000Z",
    "transactions": {
        "total": 294,
        "types": {
            "erc20": 93,
            "nft": 0,
            "transfer": 144,
            "unrecognized": 57
        },
        "values": {
            "value": {
                "avgValue": 0.3343366122304634,
                "minValue": 0,
                "medianValue": 0,
                "maxValue": 21.995,
                "sumValue": 98.29496399575623
            },
            "gas": {
                "avgGas": 0.035442864392160454,
                "medianGas": 0.017042417914345,
                "minGas": 0.0031647,
                "maxGas": 1.2892222294735,
                "sumGas": 10.420202131295174
            },
            "data": [
                {
                    "hash": "0xb41984c70cd05687fbc5d721c6bb2c02ee8158201c1749f8bb9645ea5899d7d7",
                    "type": "unrecognized",
                    "value": 0,
                    "gas": 0.07462853334800001
                },
                // ...
            ]
        }
    }
}
```
 */
export function getBlockHumanized(block: EthBlock) {
    const { types, values } = getTransactionsHumanized(block);
    const season = getBlockHumanizedSeason(block);
    const daytime = getBlockHumanizedDaytime(block);

    return ({
        number: block.number,
        season,
        daytime,
        time: new Date(block.timestamp * 1000),
        transactions: {
            total: block.transactions?.length,
            types,
            values
        }
    })
}

export {
    getBlockHumanizedSeason,
    getBlockHumanizedDaytime
}
