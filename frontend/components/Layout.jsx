'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import WalletConnectButton from './WalletConnectButton.jsx';
import { WalletProvider } from './WalletConnectButton.jsx';
import IssueCertificateForm from './IssueCertificateForm.jsx';
import VerifyCertificate from './VerifyCertificate.jsx';

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

function Layout() {
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
        {/* Hero Section - only show on verify tab */}
        {activeTab === 'verify' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">
                Verify Educational Certificates on Blockchain
              </h2>
              <p className="text-lg text-indigo-100 mb-6">
                Enter a certificate ID to instantly verify its authenticity, 
                issuing institution, and current status using our decentralized verification system.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Tamper-proof verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Institutional backing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Real-time status</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-8">
          {activeTab === 'verify' && <VerifyCertificate />}
          {activeTab === 'issue' && <IssueCertificateForm />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">
                Built on Stacks blockchain with Clarity smart contracts
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/your-repo/studentcertdapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Book className="w-4 h-4" />
                <span>Docs</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Stats Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Platform Statistics</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Certificates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">1,234</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Verified Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">89</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
        
        <div className="card">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {[
                { type: 'issued', title: 'Computer Science Degree', time: '2 hours ago' },
                { type: 'verified', title: 'Engineering Certificate', time: '4 hours ago' },
                { type: 'issued', title: 'Data Science Course', time: '6 hours ago' },
              ].map((activity, idx) => (
                <li key={idx} className="py-5">
                  <div className="relative focus:outline-none">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'issued' ? (
                          <Award className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-green-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component with Wallet Provider
export default function App() {
  return (
    <WalletProvider>
      <Layout />
    </WalletProvider>
  );
}