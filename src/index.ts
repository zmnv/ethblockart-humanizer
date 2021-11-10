import { getDaytime, getSeason } from "./inspector.advanced";
import { EthBlock, EthTransaction, TransactionTypes, TransactionValues } from "./types";

const isERC20 = ({ data, input }: Pick<EthTransaction, 'data' | 'input'>) => {
    let result = false;
    const ERC20_SIGNS = ["a9059cbb", "23b872dd", "18160ddd", "70a08231", "dd62ed3e", "095ea7b3"];

    ERC20_SIGNS.forEach((s => {
        if (result) return;
        if ((data || input).toLowerCase().startsWith(`0x${s}`)) {
            result = true;
        }
    }));

    return result;
}


const isNFT = ({ data, to, input }: Pick<EthTransaction, 'data' | 'to' | 'value' | 'input'>) => {
    let result = false;
    const NFT_SIGNS = ["1249c58b", "672a9400", "40c10f19", "449a52f8", "a140ae23"];
    NFT_SIGNS.forEach((s => {
        if (result) return;
        if ((data || input).toLowerCase().startsWith(`0x${s}`)) {
            result = true;
        }
    }));
    if (result) return result;

    if (!to) return result;

    const NFT_ART = [
        "0xaa84f7c9164db5c11b9fa65ad0118977c12a4729",
        "0xb80fbf6cdb49c33dc6ae4ca11af8ac47b0b4c0f3",
        "0x495f947276749ce646f68ac8c248420045cb7b5e",
        "0x60f80121c31a0d46b5279700f9df786054aa5ee5",
        "0x3b3ee1931dc30c1957379fac9aba94d1c48a5405",
        "0x2a46f2ffd99e19a89476e2f62270e0a35bbf0756",
        "0xfbeef911dc5821886e1dda71586d90ed28174b7d",
        "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
        "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0",
        "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        "0x06012c8cf97bead5deae237070f9587f8e7a266d",
        "0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d"
    ];

    NFT_ART.forEach((s => {
        if (result) return;
        if (to.toLowerCase().startsWith(s)) {
            result = true;
        }
    }));

    return result;
}

const isTransfer = ({ value }: Pick<EthTransaction, 'data' | 'to' | 'value'>) => {   
    if (value.hex && parseInt(value.hex, 16) !== 0) return true;
    return false;
}

const ethToValue = (v:any) => parseInt(v, 16) / 1000000000000000000;

export function getTransactionsHumanized({ transactions }: Pick<EthBlock, 'transactions'>) {

    const types: TransactionTypes = {
        erc20: 0,
        nft: 0,
        transfer: 0,
        unrecognized: 0,
    }
    const values: TransactionValues = {
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
        let currentType = 'unrecognized';
        if (isERC20(transaction)) {
            types.erc20 += 1;
            currentType = 'erc20';
        }
        else if (isNFT(transaction)) {
            types.nft += 1;
            currentType = 'nft';
        }
        else if (isTransfer(transaction)) {
            types.transfer += 1;
            currentType = 'transfer';
        } else {
            types.unrecognized += 1;
        }

        const gp = transaction.gasPrice._hex || transaction.gasPrice.hex;
        const gl = transaction.gasLimit.hex || transaction.gasLimit._hex;
        const gas = ethToValue(gp) * ethToValue(gl)*1000000000000000000;
        const val = ethToValue(transaction.value.hex || transaction.value._hex);
        dataValue.push(val);
        dataGas.push(gas)

        values.data.push({
            hash: transaction.hash,
            type: currentType,
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




export function getBlockHumanized(block: EthBlock) {
    const { types, values } = getTransactionsHumanized(block);
    const season = getSeason(block);
    const daytime = getDaytime(block);

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

