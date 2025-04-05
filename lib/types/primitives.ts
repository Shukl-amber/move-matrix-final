import { IPrimitive } from "../db/models/primitive";

export interface PrimitiveFunction {
  name: string;
  description: string;
  parameters: string[];
  returnType: string;
}

export interface Primitive {
  id: string;
  name: string;
  description: string;
  category: 'lending' | 'swap' | 'staking' | 'options' | 'custom';
  moduleAddress: string;
  moduleName: string;
  functions: PrimitiveFunction[];
  createdAt: string;
  updatedAt: string;
}

// Mock data for primitives
export const mockPrimitives: IPrimitive[] = [
  {
    id: "primitive-1",
    name: "Lending Protocol",
    category: "lending",
    description: "A primitive for lending and borrowing assets with interest accrual",
    author: "MoveMatrix",
    moduleAddress: "0x1",
    moduleName: "lending_protocol",
    functions: [
      {
        name: "deposit",
        description: "Deposit assets into the lending pool",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "withdraw",
        description: "Withdraw assets from the lending pool",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "borrow",
        description: "Borrow assets from the lending pool using collateral",
        parameters: ["amount", "account", "collateral_amount"],
        returnType: "bool"
      },
      {
        name: "repay",
        description: "Repay borrowed assets",
        parameters: ["amount", "account"],
        returnType: "bool"
      }
    ],
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-06-20"),
    deploymentAddress: "0x1"
  },
  {
    id: "primitive-2",
    name: "AMM Swap",
    category: "swap",
    description: "Automated market maker for swapping between two tokens",
    author: "MoveMatrix",
    moduleAddress: "0x2",
    moduleName: "amm_swap",
    functions: [
      {
        name: "addLiquidity",
        description: "Add liquidity to the pool",
        parameters: ["amountA", "amountB", "account"],
        returnType: "uint256"
      },
      {
        name: "removeLiquidity",
        description: "Remove liquidity from the pool",
        parameters: ["lpAmount", "account"],
        returnType: "bool"
      },
      {
        name: "swapExactTokensForTokens",
        description: "Swap an exact amount of tokens for another token",
        parameters: ["amountIn", "minAmountOut", "account"],
        returnType: "uint256"
      }
    ],
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-05-05"),
    deploymentAddress: "0x2"
  },
  {
    id: "primitive-3",
    name: "Staking Rewards",
    category: "staking",
    description: "Stake tokens to earn rewards over time",
    author: "MoveMatrix",
    moduleAddress: "0x3",
    moduleName: "staking_rewards",
    functions: [
      {
        name: "stake",
        description: "Stake tokens to start earning rewards",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "unstake",
        description: "Unstake tokens and claim rewards",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "claimRewards",
        description: "Claim rewards without unstaking",
        parameters: ["account"],
        returnType: "uint256"
      }
    ],
    createdAt: new Date("2023-03-22"),
    updatedAt: new Date("2023-04-18"),
    deploymentAddress: "0x3"
  },
  {
    id: "primitive-4",
    name: "Options Protocol",
    category: "options",
    description: "Create and trade option contracts for various assets",
    author: "MoveMatrix",
    moduleAddress: "0x4",
    moduleName: "options_protocol",
    functions: [
      {
        name: "createOption",
        description: "Create a new option contract",
        parameters: ["strikePrice", "expiration", "isCall", "account"],
        returnType: "string"
      },
      {
        name: "buyOption",
        description: "Buy an existing option contract",
        parameters: ["optionId", "amount", "account"],
        returnType: "bool"
      },
      {
        name: "sellOption",
        description: "Sell an option contract",
        parameters: ["optionId", "amount", "account"],
        returnType: "bool"
      },
      {
        name: "exerciseOption",
        description: "Exercise an option contract",
        parameters: ["optionId", "account"],
        returnType: "bool"
      }
    ],
    createdAt: new Date("2023-06-05"),
    updatedAt: new Date("2023-07-12"),
    deploymentAddress: "0x4"
  },
  {
    id: "primitive-5",
    name: "Vault Strategy",
    category: "yield",
    description: "Automated yield optimization strategy with capital allocation",
    author: "MoveMatrix",
    moduleAddress: "0x5",
    moduleName: "vault_strategy",
    functions: [
      {
        name: "deposit",
        description: "Deposit assets into the vault",
        parameters: ["amount", "account"],
        returnType: "uint256"
      },
      {
        name: "withdraw",
        description: "Withdraw assets from the vault",
        parameters: ["shares", "account"],
        returnType: "uint256"
      },
      {
        name: "harvest",
        description: "Harvest yields and reinvest",
        parameters: [],
        returnType: "uint256"
      },
      {
        name: "getAPY",
        description: "Get current APY of the strategy",
        parameters: [],
        returnType: "float"
      }
    ],
    createdAt: new Date("2023-07-18"),
    updatedAt: new Date("2023-08-30"),
    deploymentAddress: "0x5"
  },
  {
    id: "primitive-6",
    name: "Oracle Feed",
    category: "oracle",
    description: "Price feed oracle for various assets with historical data",
    author: "MoveMatrix",
    moduleAddress: "0x6",
    moduleName: "oracle_feed",
    functions: [
      {
        name: "getPrice",
        description: "Get current price of an asset",
        parameters: ["assetId"],
        returnType: "uint256"
      },
      {
        name: "getHistoricalPrice",
        description: "Get historical price at timestamp",
        parameters: ["assetId", "timestamp"],
        returnType: "uint256"
      },
      {
        name: "getTWAP",
        description: "Get time-weighted average price",
        parameters: ["assetId", "period"],
        returnType: "uint256"
      }
    ],
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-03-15"),
    deploymentAddress: "0x6"
  },
  {
    id: "liquidity-pool",
    name: "Liquidity Pool",
    description: "A primitive that implements an automated market maker liquidity pool for token pairs.",
    category: "swap",
    moduleAddress: "0xpool",
    moduleName: "liquidity_pool",
    functions: [
      {
        name: "add_liquidity",
        description: "Add liquidity to the pool with both tokens",
        parameters: ["coin_a_amount", "coin_b_amount", "min_lp_tokens"],
        returnType: "u64"
      },
      {
        name: "remove_liquidity",
        description: "Remove liquidity from the pool and get back both tokens",
        parameters: ["lp_amount", "min_a_out", "min_b_out"],
        returnType: "u64"
      },
      {
        name: "swap",
        description: "Swap one token for another through the pool",
        parameters: ["coin_in_amount", "min_out", "is_a_to_b"],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "autocompound-staking",
    name: "AutoCompound Staking",
    description: "A primitive that automatically compounds rewards for staked tokens.",
    category: "staking",
    moduleAddress: "0xstake",
    moduleName: "auto_stake",
    functions: [
      {
        name: "stake",
        description: "Stake tokens in the autocompounding vault",
        parameters: ["amount", "lock_period"],
        returnType: "u64"
      },
      {
        name: "unstake",
        description: "Unstake tokens and claim accumulated rewards",
        parameters: ["amount"],
        returnType: "u64"
      },
      {
        name: "compound",
        description: "Manually trigger compounding of rewards (can be called by anyone)",
        parameters: [],
        returnType: "bool"
      },
      {
        name: "get_apr",
        description: "Get current annual percentage rate",
        parameters: [],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 