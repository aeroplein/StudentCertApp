'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { Wallet, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const appConfig = new AppConfig(['store_write', 'publish_data']);

// Wallet Context
const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [network, setNetwork] = useState(process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet');

  useEffect(() => {
    setMounted(true);
    if (userSession.isUserSignedIn()) {
      setIsConnected(true);
      const userData = userSession.loadUserData();
      const address = network === 'mainnet' 
        ? userData.profile.stxAddress.mainnet 
        : userData.profile.stxAddress.testnet;
      setUserAddress(address);
    }
  }, [userSession, network]);

  const connectWallet = () => {
    const isMainnet = network === 'mainnet';
    
    showConnect({
      appDetails: {
        name: 'StudentCertDApp',
        icon: '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setIsConnected(true);
        const userData = userSession.loadUserData();
        const address = isMainnet 
          ? userData.profile.stxAddress.mainnet 
          : userData.profile.stxAddress.testnet;
        setUserAddress(address);
        toast.success('Wallet connected successfully!');
      },
      onCancel: () => {
        toast.error('Wallet connection cancelled');
      },
      userSession,
      network: isMainnet ? new StacksMainnet() : new StacksTestnet(),
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserAddress('');
    toast.success('Wallet disconnected');
  };

      const toggleNetwork = () => {
    const newNetwork = network === 'testnet' ? 'mainnet' : 'testnet';
    setNetwork(newNetwork);
    
    if (isConnected) {
      const userData = userSession.loadUserData();
      const address = newNetwork === 'mainnet' 
        ? userData.profile.stxAddress.mainnet 
        : userData.profile.stxAddress.testnet;
      setUserAddress(address);
    }
    
    toast.success(`Switched to ${newNetwork}`);
  };

  const value = {
    isConnected,
    userAddress,
    userSession,
    network,
    setNetwork,
    connectWallet,
    disconnectWallet,
    toggleNetwork,
    mounted
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default function WalletConnectButton() {
  const { 
    isConnected, 
    userAddress, 
    network, 
    connectWallet, 
    disconnectWallet, 
    toggleNetwork, 
    mounted 
  } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Network Toggle */}
      <button
        onClick={toggleNetwork}
        className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
          network === 'testnet' 
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        }`}
      >
        {network === 'testnet' ? 'Testnet' : 'Mainnet'}
      </button>

      {/* Connect/Disconnect Button */}
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="btn-primary flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {formatAddress(userAddress)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg transition-colors"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Legacy hook for backwards compatibility
export function useWalletConnection() {
  return useWallet();
}