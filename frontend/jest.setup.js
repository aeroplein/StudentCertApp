import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Stacks Connect
jest.mock('@stacks/connect', () => ({
  AppConfig: jest.fn(() => ({})),
  UserSession: jest.fn(() => ({
    isUserSignedIn: jest.fn(() => false),
    loadUserData: jest.fn(() => ({
      profile: {
        stxAddress: {
          testnet: 'ST1TESTADDRESS',
          mainnet: 'SP1TESTADDRESS'
        }
      },
      appPrivateKey: 'test-private-key'
    })),
    signUserOut: jest.fn(),
  })),
  showConnect: jest.fn(),
}));

// Mock Stacks Transactions
jest.mock('@stacks/transactions', () => ({
  makeContractCall: jest.fn(),
  broadcastTransaction: jest.fn(),
  callReadOnlyFunction: jest.fn(),
  cvToValue: jest.fn(),
  stringAsciiCV: jest.fn(),
  principalCV: jest.fn(),
  uintCV: jest.fn(),
  someCV: jest.fn(),
  noneCV: jest.fn(),
  AnchorMode: {
    Any: 3
  },
  PostConditionMode: {
    Allow: 1
  }
}));

// Mock Stacks Network
jest.mock('@stacks/network', () => ({
  StacksTestnet: jest.fn(() => ({ version: 0x80000000 })),
  StacksMainnet: jest.fn(() => ({ version: 0x00000000 })),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

// Global test utilities
global.mockContractCall = (returnValue = { txid: 'test-tx-id' }) => {
  const { makeContractCall, broadcastTransaction } = require('@stacks/transactions');
  makeContractCall.mockResolvedValue({ serialize: () => 'mock-transaction' });
  broadcastTransaction.mockResolvedValue(returnValue);
};

global.mockReadOnlyCall = (returnValue) => {
  const { callReadOnlyFunction, cvToValue } = require('@stacks/transactions');
  callReadOnlyFunction.mockResolvedValue('mock-cv-response');
  cvToValue.mockReturnValue(returnValue);
};

// Environment variables for tests
process.env.NEXT_PUBLIC_STACKS_NETWORK = 'testnet';
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = 'ST1TESTCONTRACT';
process.env.NEXT_PUBLIC_CONTRACT_NAME = 'certificate';
process.env.NEXT_PUBLIC_STACKS_API_URL = 'https://stacks-node-api.testnet.stacks.co';