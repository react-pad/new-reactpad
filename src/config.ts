import { maxUint256, type Address } from 'viem';
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { baseSepolia, reactiveTestnet } from "viem/chains";
import { createConfig, http } from "wagmi";

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Suggested',
            wallets: [
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
                coinbaseWallet
            ],
        },
    ],
    {
        appName: 'ReactPad',
        projectId: '05f1bc7c3d4ce4d40fe55e540e58c2da', // Replace with your WalletConnect project ID
    }
);

export const config = createConfig({
    chains: [baseSepolia, reactiveTestnet],
    connectors,
    transports: {
        [baseSepolia.id]: http(),
        [reactiveTestnet.id]: http(),
    },
});


export const REACT_TOKEN_PRICE_USD = 0.067;
const uint256Max = maxUint256;
const feeToSpacing = {
    3000: 60,
    500: 10,
};

export const OWNER = "0x8ed51aDf35BEAa024A868120EDbCd1843099F481";

export const FactoryContract = {
    address: "0x153A2142D68EE6Bd2a4Cd63b46C0f60aeC34cc14",
    abi:
        [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_feeToSetter",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "token0",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "token1",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "pair",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "PairCreated",
                "type": "event"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "INIT_CODE_PAIR_HASH",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "allPairs",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "allPairsLength",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "tokenA",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenB",
                        "type": "address"
                    }
                ],
                "name": "createPair",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "pair",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "feeTo",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "feeToSetter",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "getPair",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_feeTo",
                        "type": "address"
                    }
                ],
                "name": "setFeeTo",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_feeToSetter",
                        "type": "address"
                    }
                ],
                "name": "setFeeToSetter",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
} as const;

export const Multicall3Contract = {
    address: "0xcA11bde05977b3631167028862bE2a173976CA11", // Standard Multicall3 address on many chains
    abi: [
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Call[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "aggregate",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "blockNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes[]",
                    "name": "returnData",
                    "type": "bytes[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bool",
                            "name": "allowFailure",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall3.Call3[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "aggregate3",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "returnData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall3.Result[]",
                    "name": "returnData",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bool",
                            "name": "allowFailure",
                            "type": "bool"
                        },
                        {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall3.Call3Value[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "aggregate3Value",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "returnData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall3.Result[]",
                    "name": "returnData",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Call[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "blockAndAggregate",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "blockNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "blockHash",
                    "type": "bytes32"
                },
                {
                    "components": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "returnData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Result[]",
                    "name": "returnData",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBasefee",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "basefee",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "blockNumber",
                    "type": "uint256"
                }
            ],
            "name": "getBlockHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "blockHash",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBlockNumber",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "blockNumber",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getChainId",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "chainid",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentBlockCoinbase",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "coinbase",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentBlockDifficulty",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "difficulty",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentBlockGasLimit",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "gaslimit",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCurrentBlockTimestamp",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "getEthBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getLastBlockHash",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "blockHash",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "requireSuccess",
                    "type": "bool"
                },
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Call[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "tryAggregate",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "returnData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Result[]",
                    "name": "returnData",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "requireSuccess",
                    "type": "bool"
                },
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "target",
                            "type": "address"
                        },
                        {
                            "internalType": "bytes",
                            "name": "callData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Call[]",
                    "name": "calls",
                    "type": "tuple[]"
                }
            ],
            "name": "tryBlockAndAggregate",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "blockNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "blockHash",
                    "type": "bytes32"
                },
                {
                    "components": [
                        {
                            "internalType": "bool",
                            "name": "success",
                            "type": "bool"
                        },
                        {
                            "internalType": "bytes",
                            "name": "returnData",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct Multicall2.Result[]",
                    "name": "returnData",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        }
    ]
} as const;

export const RouterContract = {
    address: "0x81850e53DEc753b95DE4599173755bc640575c3D",
    abi: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_factory",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_WETH",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "WETH",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenA",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenB",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amountADesired",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountBDesired",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountAMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountBMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "addLiquidity",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountB",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenDesired",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETHMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "addLiquidityETH",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountToken",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETH",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "factory",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveOut",
                    "type": "uint256"
                }
            ],
            "name": "getAmountIn",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveOut",
                    "type": "uint256"
                }
            ],
            "name": "getAmountOut",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                }
            ],
            "name": "getAmountsIn",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                }
            ],
            "name": "getAmountsOut",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveB",
                    "type": "uint256"
                }
            ],
            "name": "quote",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountB",
                    "type": "uint256"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenA",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenB",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountAMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountBMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "removeLiquidity",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountB",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETHMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "removeLiquidityETH",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountToken",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETH",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETHMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "removeLiquidityETHSupportingFeeOnTransferTokens",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountETH",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETHMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "approveMax",
                    "type": "bool"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "removeLiquidityETHWithPermit",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountToken",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETH",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountTokenMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountETHMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "approveMax",
                    "type": "bool"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountETH",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenA",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenB",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountAMin",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountBMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "approveMax",
                    "type": "bool"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "removeLiquidityWithPermit",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountA",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountB",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapETHForExactTokens",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactETHForTokens",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactTokensForETH",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactTokensForTokens",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountOutMin",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountInMax",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapTokensForExactETH",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amountInMax",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "path",
                    "type": "address[]"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                }
            ],
            "name": "swapTokensForExactTokens",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ]
} as const;

export const Weth9Contract = {
    address: "0xe00CBca00d36c89819289dE34e352881E8F475Fd", // WREACT Contract
    abi: [
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "guy",
                    "type": "address"
                },
                {
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "src",
                    "type": "address"
                },
                {
                    "name": "dst",
                    "type": "address"
                },
                {
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "withdraw",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "dst",
                    "type": "address"
                },
                {
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "src",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "guy",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "src",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "dst",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "dst",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "Deposit",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "src",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "wad",
                    "type": "uint256"
                }
            ],
            "name": "Withdrawal",
            "type": "event"
        }
    ]
} as const;

export const MultiCall = {
    address: "0xc73290EC0D30c793250D50d2Ec1BCFa36e2B00c8", //Multicall Contract
    abi: []
} as const;

export const PairContract = {
    address: "0x60aa94C520ee3f5fCf488F17b304579Ef80C36Ec",
    abi: [
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount0",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount1",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "Burn",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount0",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount1",
                    "type": "uint256"
                }
            ],
            "name": "Mint",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount0In",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount1In",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount0Out",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount1Out",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "Swap",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint112",
                    "name": "reserve0",
                    "type": "uint112"
                },
                {
                    "indexed": false,
                    "internalType": "uint112",
                    "name": "reserve1",
                    "type": "uint112"
                }
            ],
            "name": "Sync",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "DOMAIN_SEPARATOR",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "MINIMUM_LIQUIDITY",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "PERMIT_TYPEHASH",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "burn",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amount0",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount1",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "factory",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getReserves",
            "outputs": [
                {
                    "internalType": "uint112",
                    "name": "_reserve0",
                    "type": "uint112"
                },
                {
                    "internalType": "uint112",
                    "name": "_reserve1",
                    "type": "uint112"
                },
                {
                    "internalType": "uint32",
                    "name": "_blockTimestampLast",
                    "type": "uint32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_token0",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_token1",
                    "type": "address"
                }
            ],
            "name": "initialize",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "kLast",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "mint",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "liquidity",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "nonces",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "permit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "price0CumulativeLast",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "price1CumulativeLast",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "skim",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount0Out",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount1Out",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "swap",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "sync",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "token0",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "token1",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
} as const;

export const V2ERC20 = {
    abi: [
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "DOMAIN_SEPARATOR",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "PERMIT_TYPEHASH",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "nonces",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "permit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};

export const AirdropMultiSender = {
    address: "0x07Da7438CEB61B6adc3817E337fBB8a19c4AF00E",
    abi: [{ "inputs": [], "name": "InvalidAmount", "type": "error" }, { "inputs": [], "name": "InvalidRecipient", "type": "error" }, { "inputs": [], "name": "LengthMismatch", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "SafeERC20FailedOperation", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }], "name": "EthSent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }], "name": "TokensSent", "type": "event" }, { "inputs": [{ "internalType": "contract IERC20", "name": "token", "type": "address" }, { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "sendERC20", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "sendETH", "outputs": [], "stateMutability": "payable", "type": "function" }]
}

export const NFTFactory = {
    address: "0xc73290EC0D30c793250D50d2Ec1BCFa36e2B00c8",
    abi: [
        {
            "type": "function",
            "name": "createETHNFT",
            "inputs": [
                {
                    "name": "params",
                    "type": "tuple",
                    "internalType": "struct NFTFactory.NFTParams",
                    "components": [
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "symbol",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "baseURI",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "maxSupply",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "payoutWallet",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "mintConfig",
                            "type": "tuple",
                            "internalType": "struct MintConfig",
                            "components": [
                                {
                                    "name": "saleStart",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "saleEnd",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "walletLimit",
                                    "type": "uint32",
                                    "internalType": "uint32"
                                },
                                {
                                    "name": "price",
                                    "type": "uint128",
                                    "internalType": "uint128"
                                }
                            ]
                        }
                    ]
                }
            ],
            "outputs": [
                {
                    "name": "nft",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "createUSDCNFT",
            "inputs": [
                {
                    "name": "params",
                    "type": "tuple",
                    "internalType": "struct NFTFactory.NFTParams",
                    "components": [
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "symbol",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "baseURI",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "maxSupply",
                            "type": "uint256",
                            "internalType": "uint256"
                        },
                        {
                            "name": "payoutWallet",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "mintConfig",
                            "type": "tuple",
                            "internalType": "struct MintConfig",
                            "components": [
                                {
                                    "name": "saleStart",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "saleEnd",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "walletLimit",
                                    "type": "uint32",
                                    "internalType": "uint32"
                                },
                                {
                                    "name": "price",
                                    "type": "uint128",
                                    "internalType": "uint128"
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "paymentToken",
                    "type": "address",
                    "internalType": "contract IERC20"
                }
            ],
            "outputs": [
                {
                    "name": "nft",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "deployments",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "nft",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "acceptsEth",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "tokensCreatedBy",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalDeployments",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "NFTCreated",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "nft",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "acceptsEth",
                    "type": "bool",
                    "indexed": true,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        }
    ]
}

export const PresaleContract = {

    abi: [
        {
            "inputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "saleToken_",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "paymentToken_",
                    "type": "address"
                },
                {
                    "internalType": "struct PresaleConfig",
                    "name": "config",
                    "type": "tuple",
                    "components": [
                        {
                            "internalType": "uint64",
                            "name": "startTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint64",
                            "name": "endTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint256",
                            "name": "rate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "softCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "hardCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "minContribution",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "maxContribution",
                            "type": "uint256"
                        }
                    ]
                },
                { "internalType": "address", "name": "owner_", "type": "address" },
                {
                    "internalType": "address",
                    "name": "feeRecipient_",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "target", "type": "address" }
            ],
            "type": "error",
            "name": "AddressEmptyCode"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "account", "type": "address" }
            ],
            "type": "error",
            "name": "AddressInsufficientBalance"
        },
        { "inputs": [], "type": "error", "name": "AlreadyFinalized" },
        { "inputs": [], "type": "error", "name": "ClaimNotEnabled" },
        { "inputs": [], "type": "error", "name": "FailedInnerCall" },
        { "inputs": [], "type": "error", "name": "HardCapReached" },
        { "inputs": [], "type": "error", "name": "InvalidAmount" },
        { "inputs": [], "type": "error", "name": "NotWhitelisted" },
        { "inputs": [], "type": "error", "name": "NothingToClaim" },
        {
            "inputs": [
                { "internalType": "address", "name": "owner", "type": "address" }
            ],
            "type": "error",
            "name": "OwnableInvalidOwner"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "account", "type": "address" }
            ],
            "type": "error",
            "name": "OwnableUnauthorizedAccount"
        },
        {
            "inputs": [],
            "type": "error",
            "name": "ReentrancyGuardReentrantCall"
        },
        { "inputs": [], "type": "error", "name": "RefundsNotEnabled" },
        {
            "inputs": [
                { "internalType": "address", "name": "token", "type": "address" }
            ],
            "type": "error",
            "name": "SafeERC20FailedOperation"
        },
        { "inputs": [], "type": "error", "name": "SaleEnded" },
        { "inputs": [], "type": "error", "name": "SaleNotActive" },
        {
            "inputs": [
                {
                    "internalType": "struct PresaleConfig",
                    "name": "config",
                    "type": "tuple",
                    "components": [
                        {
                            "internalType": "uint64",
                            "name": "startTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint64",
                            "name": "endTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint256",
                            "name": "rate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "softCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "hardCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "minContribution",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "maxContribution",
                            "type": "uint256"
                        }
                    ],
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "ConfigUpdated",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address",
                    "indexed": true
                },
                {
                    "internalType": "uint256",
                    "name": "paymentAmount",
                    "type": "uint256",
                    "indexed": false
                },
                {
                    "internalType": "uint256",
                    "name": "tokenAmount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "ContributionReceived",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address",
                    "indexed": true
                },
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address",
                    "indexed": true
                }
            ],
            "type": "event",
            "name": "OwnershipTransferred",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "successful",
                    "type": "bool",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "PresaleFinalized",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "ProceedsFeeCollected",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "ProceedsWithdrawn",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address",
                    "indexed": true
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "RefundClaimed",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "TokenFeeCollected",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address",
                    "indexed": true
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "TokensClaimed",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "TokensDeposited",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "TokensWithdrawn",
            "anonymous": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address",
                    "indexed": true
                },
                {
                    "internalType": "bool",
                    "name": "allowed",
                    "type": "bool",
                    "indexed": false
                }
            ],
            "type": "event",
            "name": "WhitelistUpdated",
            "anonymous": false
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "FEE_BPS_DENOMINATOR",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "PROCEEDS_FEE_BPS",
            "outputs": [
                { "internalType": "uint96", "name": "", "type": "uint96" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "RATE_DIVISOR",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "TOKEN_FEE_BPS",
            "outputs": [
                { "internalType": "uint96", "name": "", "type": "uint96" }
            ]
        },
        {
            "inputs": [
                {
                    "internalType": "address[]",
                    "name": "accounts",
                    "type": "address[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "addManyToWhitelist"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "account", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "addToWhitelist"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "cancelPresale"
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "claimEnabled",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "claimRefund"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "claimTokens"
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "committedTokens",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "stateMutability": "payable",
            "type": "function",
            "name": "contribute"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ],
            "stateMutability": "view",
            "type": "function",
            "name": "contributions",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "depositSaleTokens"
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "endTime",
            "outputs": [
                { "internalType": "uint64", "name": "", "type": "uint64" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "feeRecipient",
            "outputs": [
                { "internalType": "address payable", "name": "", "type": "address" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "finalize"
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "hardCap",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "isPaymentETH",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "maxContribution",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "minContribution",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "owner",
            "outputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "paymentToken",
            "outputs": [
                { "internalType": "contract IERC20", "name": "", "type": "address" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "proceedsClaimed",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "proceedsFeesCollected",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ],
            "stateMutability": "view",
            "type": "function",
            "name": "purchasedTokens",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "rate",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "refundsEnabled",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
            "inputs": [
                { "internalType": "address", "name": "account", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "removeFromWhitelist"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "renounceOwnership"
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "saleToken",
            "outputs": [
                { "internalType": "contract IERC20", "name": "", "type": "address" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "softCap",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "startTime",
            "outputs": [
                { "internalType": "uint64", "name": "", "type": "uint64" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "tokenFeesCollected",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "tokensWithdrawn",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "totalRaised",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "totalTokensDeposited",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ]
        },
        {
            "inputs": [
                { "internalType": "address", "name": "newOwner", "type": "address" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "transferOwnership"
        },
        {
            "inputs": [
                {
                    "internalType": "struct PresaleConfig",
                    "name": "config",
                    "type": "tuple",
                    "components": [
                        {
                            "internalType": "uint64",
                            "name": "startTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint64",
                            "name": "endTime",
                            "type": "uint64"
                        },
                        {
                            "internalType": "uint256",
                            "name": "rate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "softCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "hardCap",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "minContribution",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "maxContribution",
                            "type": "uint256"
                        }
                    ]
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "updateConfig"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "", "type": "address" }
            ],
            "stateMutability": "view",
            "type": "function",
            "name": "whitelist",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "withdrawProceeds"
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "withdrawUnusedTokens"
        }
    ]
}

export const PresaleFactory = {
    address: "0x23b09983e7f4a13b4db40661c8f45580c692b262",
    abi: [
        { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
        {
            "type": "function",
            "name": "allPresales",
            "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
            "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "createPresale",
            "inputs": [
                {
                    "name": "params",
                    "type": "tuple",
                    "internalType": "struct PresaleFactory.CreateParams",
                    "components": [
                        {
                            "name": "saleToken",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "paymentToken",
                            "type": "address",
                            "internalType": "address"
                        },
                        {
                            "name": "config",
                            "type": "tuple",
                            "internalType": "struct PresaleConfig",
                            "components": [
                                {
                                    "name": "startTime",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "endTime",
                                    "type": "uint64",
                                    "internalType": "uint64"
                                },
                                {
                                    "name": "rate",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "softCap",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "hardCap",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "minContribution",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                },
                                {
                                    "name": "maxContribution",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                }
                            ]
                        },
                        { "name": "owner", "type": "address", "internalType": "address" },
                        {
                            "name": "requiresWhitelist",
                            "type": "bool",
                            "internalType": "bool"
                        }
                    ]
                }
            ],
            "outputs": [
                { "name": "presale", "type": "address", "internalType": "address" }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "factoryOwner",
            "inputs": [],
            "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "feeRecipient",
            "inputs": [],
            "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "presalesCreatedBy",
            "inputs": [
                { "name": "creator", "type": "address", "internalType": "address" }
            ],
            "outputs": [
                { "name": "", "type": "address[]", "internalType": "address[]" }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setFeeRecipient",
            "inputs": [
                { "name": "newRecipient", "type": "address", "internalType": "address" }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "totalPresales",
            "inputs": [],
            "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "FeeRecipientUpdated",
            "inputs": [
                {
                    "name": "newRecipient",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "PresaleCreated",
            "inputs": [
                {
                    "name": "creator",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "presale",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "saleToken",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "paymentToken",
                    "type": "address",
                    "indexed": false,
                    "internalType": "address"
                },
                {
                    "name": "requiresWhitelist",
                    "type": "bool",
                    "indexed": false,
                    "internalType": "bool"
                }
            ],
            "anonymous": false
        }
    ] as const
} as const

export const TokenFactory = {
    address: "0x150b0cC0B2deCf3bAF5A9d41e55C52132Fad12C5",
    abi: [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "enum TokenFactory.TokenType", "name": "tokenType", "type": "uint8" }], "name": "TokenCreated", "type": "event" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "initialRecipient", "type": "address" }], "internalType": "struct TokenFactory.TokenParams", "name": "params", "type": "tuple" }], "name": "createBurnableToken", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "initialRecipient", "type": "address" }], "internalType": "struct TokenFactory.TokenParams", "name": "params", "type": "tuple" }], "name": "createMintableToken", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "initialRecipient", "type": "address" }], "internalType": "struct TokenFactory.TokenParams", "name": "params", "type": "tuple" }], "name": "createNonMintableToken", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "initialRecipient", "type": "address" }], "internalType": "struct TokenFactory.TokenParams", "name": "params", "type": "tuple" }], "name": "createPlainToken", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "initialRecipient", "type": "address" }], "internalType": "struct TokenFactory.TokenParams", "name": "params", "type": "tuple" }, { "components": [{ "internalType": "address", "name": "taxWallet", "type": "address" }, { "internalType": "uint96", "name": "taxBps", "type": "uint96" }], "internalType": "struct TokenFactory.TaxParams", "name": "tax", "type": "tuple" }], "name": "createTaxableToken", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "deployments", "outputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "enum TokenFactory.TokenType", "name": "tokenType", "type": "uint8" }, { "internalType": "address", "name": "creator", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "creator", "type": "address" }], "name": "tokensCreatedBy", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalDeployments", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
}

export const TokenLocker = {
    address: "0x71020acf0f87a7Ee60d06B9485AC295F2e2baBF1" as Address,
    abi: [{ "inputs": [], "name": "AlreadyUnlocked", "type": "error" }, { "inputs": [], "name": "InvalidAddress", "type": "error" }, { "inputs": [], "name": "InvalidAmount", "type": "error" }, { "inputs": [], "name": "InvalidLockId", "type": "error" }, { "inputs": [], "name": "InvalidToken", "type": "error" }, { "inputs": [], "name": "LockNotExpired", "type": "error" }, { "inputs": [], "name": "NotOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "SafeERC20FailedOperation", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint64", "name": "unlockDate", "type": "uint64" }], "name": "LockCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "indexed": false, "internalType": "uint64", "name": "newUnlockDate", "type": "uint64" }], "name": "LockExtended", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "LockReleased", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "LockTransferred", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }], "name": "canUnlock", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "internalType": "uint64", "name": "additionalTime", "type": "uint64" }], "name": "extendLock", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getAllLocksOfOwner", "outputs": [{ "internalType": "uint256[]", "name": "lockIds", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }], "name": "getLock", "outputs": [{ "components": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint64", "name": "lockDate", "type": "uint64" }, { "internalType": "uint64", "name": "unlockDate", "type": "uint64" }, { "internalType": "bool", "name": "withdrawn", "type": "bool" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }], "internalType": "struct TokenLocker.LockInfo", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "lockIds", "type": "uint256[]" }], "name": "getLocksInfo", "outputs": [{ "components": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint64", "name": "lockDate", "type": "uint64" }, { "internalType": "uint64", "name": "unlockDate", "type": "uint64" }, { "internalType": "bool", "name": "withdrawn", "type": "bool" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }], "internalType": "struct TokenLocker.LockInfo[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }], "name": "getRemainingTime", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "isLockOwner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint64", "name": "lockDuration", "type": "uint64" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }], "name": "lockTokens", "outputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "locksOfOwner", "outputs": [{ "internalType": "uint256[]", "name": "lockIds", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalLocks", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }, { "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferLockOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lockId", "type": "uint256" }], "name": "unlock", "outputs": [], "stateMutability": "nonpayable", "type": "function" }] as const
}

export const erc20Abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
] as const;


export const LaunchpadPresaleContract = PresaleContract;


// Token definitions for Sepolia testnet
export const TOKENS = {
    WBLOCX: {
        symbol: 'WBLOCX',
        name: 'Wrapped BLOCX',
        address: '0xe00CBca00d36c89819289dE34e352881E8F475Fd',
        decimals: 18,
        logoURI: 'https://res.cloudinary.com/dma1c8i6n/image/upload/v1760088649/wBLOCX_ldu8l2.png',
        color: '#1E90FF'
    },
};

export const TOKEN_LIST = Object.values(TOKENS);

// Contract aliases for backward compatibility
export const AirdropMultisenderContract = AirdropMultiSender;
export const NFTFactoryContract = NFTFactory;
export const PresaleFactoryContract = PresaleFactory;

// LaunchpadNFT contract ABI (for NFTs created by NFTFactory)
export const LaunchpadNFTContract = {
    abi: [
        {
            "type": "function",
            "name": "name",
            "inputs": [],
            "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "symbol",
            "inputs": [],
            "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "maxSupply",
            "inputs": [],
            "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalMinted",
            "inputs": [],
            "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mintPrice",
            "inputs": [],
            "outputs": [{ "name": "", "type": "uint128", "internalType": "uint128" }],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "mint",
            "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
            "outputs": [],
            "stateMutability": "payable"
        }
    ]
};

export { feeToSpacing, uint256Max };
