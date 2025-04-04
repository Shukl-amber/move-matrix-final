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
export const mockPrimitives: Primitive[] = [
  {
    id: 'lending-primitive-1',
    name: 'Basic Lending',
    description: 'A simple lending primitive that allows users to deposit and borrow assets.',
    category: 'lending',
    moduleAddress: '0x1',
    moduleName: 'lending_primitive',
    functions: [
      {
        name: 'deposit',
        description: 'Deposit assets into the lending pool',
        parameters: ['address', 'u64'],
        returnType: 'bool',
      },
      {
        name: 'withdraw',
        description: 'Withdraw assets from the lending pool',
        parameters: ['address', 'u64'],
        returnType: 'bool',
      },
      {
        name: 'borrow',
        description: 'Borrow assets from the lending pool',
        parameters: ['address', 'u64'],
        returnType: 'bool',
      },
      {
        name: 'repay',
        description: 'Repay borrowed assets',
        parameters: ['address', 'u64'],
        returnType: 'bool',
      },
    ],
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-04-01T00:00:00Z',
  },
  {
    id: 'swap-primitive-1',
    name: 'Basic Swap',
    description: 'A simple swap primitive that allows users to exchange one asset for another.',
    category: 'swap',
    moduleAddress: '0x1',
    moduleName: 'swap_primitive',
    functions: [
      {
        name: 'swap',
        description: 'Swap one asset for another',
        parameters: ['address', 'address', 'u64'],
        returnType: 'u64',
      },
      {
        name: 'add_liquidity',
        description: 'Add liquidity to the swap pool',
        parameters: ['address', 'address', 'u64', 'u64'],
        returnType: 'u64',
      },
      {
        name: 'remove_liquidity',
        description: 'Remove liquidity from the swap pool',
        parameters: ['address', 'address', 'u64'],
        returnType: 'u64, u64',
      },
    ],
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-04-01T00:00:00Z',
  },
]; 