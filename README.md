# ETHGlobal 2024 Workshop

Example repo containing the simple dapp (frontend only) which utilizes [Modular Execution environment (MEE)](https://www.biconomy.io/post/modular-execution-environment-supertransactions) to execute
a cross-chain mint.

The NFT contract is deployed on [Base Sepolia](https://sepolia.basescan.org/address/0x071Ff778e91cFF52e9b3A30A672b2daeD7972FAF#code) and the price of one mint operation is set to be 0.1 USDC - the official testnet USDC provided by Circle.

This demo app shows how users can pay for the NFT mint on Base by paying with USDC from any other chain.

## Build and run the project

```shell
$ npm run dev
```

## Recommended Environment

- node v18
- typescript@5+
- viem@2+
- klaster-sdk@0.5.11

## Useful Resources

- [USDC Faucet](https://developers.circle.com/stablecoins/usdc-on-test-networks)
- [MEE Zero2Hero](https://docs.klaster.io/zero-to-hero-klaster-guide)
- [MEE Explorer](https://explorer.klaster.io)
- [MEE Node Info](https://klaster-node.polycode.sh/info)
- [MEE Supertransaction status API example](https://klaster-node.polycode.sh/v2/explorer/0xa151dfaa4d75fad527c5767f10b1bb0001849b9b2f5e648b79b8ab857558ca86)

## Developer Support

Join [this group](https://t.me/+Hn8FmDJ9XC02MmQ1) if you need help with any technical questions or issues.
