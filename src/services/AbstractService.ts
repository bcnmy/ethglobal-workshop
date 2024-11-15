import { batchTx, BiconomyV2AccountInitData, buildItx, buildMultichainReadonlyClient, buildRpcInfo, buildTokenMapping, deployment, encodeBridgingOps, ExecuteResponse, initKlaster, klasterNodeHost, KlasterSDK, loadBicoV2Account, MultichainClient, MultichainTokenMapping, rawTx, UnifiedBalanceResult } from "klaster-sdk";
import { Address, encodeFunctionData, erc20Abi, WalletClient } from "viem";
import { arbitrumSepolia, baseSepolia, mainnet, sepolia } from "viem/chains";
import { acrossBridgePlugin } from "../plugins/AcrossBridgePlugin";
import { NFT_ABI } from "../abi/NFT";

const NFT_BASE = "0x071Ff778e91cFF52e9b3A30A672b2daeD7972FAF";
const NFT_MINT_PRICE = 100000n; // $0.1

const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const USDC_BASE = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_ARBITRUM = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

let walletClient: WalletClient;
let eoaAddress: string;
let klaster: KlasterSDK<BiconomyV2AccountInitData>;
let mcClient: MultichainClient;
let mcUSDC: MultichainTokenMapping;

export async function initKlasterService(walletClientInstance: WalletClient, address: string): Promise<string> {
    walletClient = walletClientInstance;
    eoaAddress = address;
    klaster = await initKlaster({
        accountInitData: loadBicoV2Account({
            owner: address as Address,
            salt: "00000000000000000000000000000001"
        }),
        nodeUrl: klasterNodeHost.default
    });

    mcClient = buildMultichainReadonlyClient([
        buildRpcInfo(sepolia.id, sepolia.rpcUrls.default.http[0]),
        buildRpcInfo(arbitrumSepolia.id, arbitrumSepolia.rpcUrls.default.http[0]),
        buildRpcInfo(baseSepolia.id, baseSepolia.rpcUrls.default.http[0]),
    ]);

    mcUSDC = buildTokenMapping([
        deployment(sepolia.id, USDC_SEPOLIA),
        deployment(arbitrumSepolia.id, USDC_ARBITRUM),
        deployment(baseSepolia.id, USDC_BASE),
    ]);

    return klaster.account.getAddress(mainnet.id)!;
}

export async function getKlasterBalance(): Promise<UnifiedBalanceResult> {
    return mcClient.getUnifiedErc20Balance({
        account: klaster.account,
        tokenMapping: mcUSDC
    });
}

export async function crossChainMint(): Promise<ExecuteResponse> {
    const uBalance = await getKlasterBalance();

    const bridgingOps = await encodeBridgingOps({
        tokenMapping: mcUSDC,
        account: klaster.account,
        amount: 2000000n, // bridge 2 USDC
        bridgePlugin: acrossBridgePlugin,
        client: mcClient,
        destinationChainId: baseSepolia.id,
        unifiedBalance: uBalance,
    });

    const mintOperation = batchTx(baseSepolia.id, [
        rawTx({
            gasLimit: 100000n,
            to: USDC_BASE,
            data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "approve",
                args: [NFT_BASE, NFT_MINT_PRICE]
            })
        }),
        rawTx({
            gasLimit: 100000n,
            to: NFT_BASE,
            data: encodeFunctionData({
                abi: NFT_ABI,
                functionName: "mint",
                args: []
            })
        })
    ]);

    const iTx = buildItx({
        // BridgingOPs + Execution on the destination chain
        // added as steps to the iTx
        steps: bridgingOps.steps.concat(mintOperation),
        // Klaster works with cross-chain gas abstraction. This instructs the Klaster
        // nodes to take USDC on Optimism as tx fee payment.
        feeTx: klaster.encodePaymentFee(sepolia.id, "USDC"),
    });

    const quote = await klaster.getQuote(iTx);
    console.log("quote", quote);

    const signature = await walletClient.signMessage({
        account: eoaAddress as Address,
        message: {
            raw: quote.itxHash
        }
    });

    return klaster.execute(quote, signature);
}
