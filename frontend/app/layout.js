'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '../components/WalletConnectButton';
import WalletConnectButton from '../components/WalletConnectButton';
import IssueCertificateForm from '../components/IssueCertificateForm';
import VerifyCertificate from '../components/VerifyCertificate';
import { 
  GraduationCap, 
  Award, 
  Shield, 
  BarChart3, 
  Menu, 
  X,
  Github,
  Book
} from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('verify');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'verify', name: 'Verify Certificate', icon: Shield },
    { id: 'issue', name: 'Issue Certificate', icon: Award },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StudentCertDApp</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Blockchain Certificate Verification Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Wallet Connect & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <WalletConnectButton />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Area */}
        <div className="space-y-8">
          {activeTab === 'verify' && <VerifyCertificate />}
          {activeTab === 'issue' && <IssueCertificateForm />}
          {activeTab === 'dashboard' && <div>Dashboard placeholder</div>}
        </div>
      </main>
    </div>
  );
}

// Main App Component with Wallet Provider
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <MainLayout />
        </WalletProvider>
        {children}
      </body>
    </html>
  );
}

