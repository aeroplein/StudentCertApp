'use client';

import process from "node:process";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  principalCV,
  uintCV,
  someCV,
  noneCV
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { useWallet } from './WalletConnectButton.jsx';
import { Award, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'certificate';

export default function IssueCertificateForm() {
  const { isConnected, userAddress: _userAddress, userSession, network } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    if (!isConnected || !CONTRACT_ADDRESS) {
      toast.error('Please connect your wallet and ensure contract is deployed');
      return;
    }

    setIsLoading(true);
    
    try {
      const stacksNetwork = network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
      
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'issue-certificate',
        functionArgs: [
          principalCV(data.recipient),
          uintCV(parseInt(data.institutionId)),
          stringAsciiCV(data.title),
          stringAsciiCV(data.description),
          data.metadataUri ? someCV(stringAsciiCV(data.metadataUri)) : noneCV(),
          data.grade ? someCV(stringAsciiCV(data.grade)) : noneCV()
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 10000n
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, stacksNetwork);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      setTxId(result.txid);
      toast.success('Certificate issued successfully!');
      reset();
      
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error(`Failed to issue certificate: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Wallet Not Connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please connect your wallet to issue certificates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Issue Certificate</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
            Recipient Address *
          </label>
          <input
            type="text"
            id="recipient"
            {...register('recipient', { 
              required: 'Recipient address is required',
              pattern: {
                value: /^S[PM][0-9A-Z]+$/,
                message: 'Invalid Stacks address format'
              }
            })}
            className="form-input"
            placeholder="SP1ABCD..."
          />
          {errors.recipient && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
          )}
        </div>

        {/* Institution ID */}
        <div>
          <label htmlFor="institutionId" className="block text-sm font-medium text-gray-700">
            Institution ID *
          </label>
          <input
            type="number"
            id="institutionId"
            {...register('institutionId', { 
              required: 'Institution ID is required',
              min: { value: 1, message: 'Institution ID must be at least 1' }
            })}
            className="form-input"
            placeholder="1"
          />
          {errors.institutionId && (
            <p className="mt-1 text-sm text-red-600">{errors.institutionId.message}</p>
          )}
        </div>

        {/* Certificate Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Certificate Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title', { 
              required: 'Certificate title is required',
              maxLength: { value: 200, message: 'Title must be less than 200 characters' }
            })}
            className="form-input"
            placeholder="Bachelor of Computer Science"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description', { 
              required: 'Description is required',
              maxLength: { value: 500, message: 'Description must be less than 500 characters' }
            })}
            className="form-textarea"
            placeholder="This certificate confirms successful completion of..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Grade (Optional) */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Grade (Optional)
          </label>
          <input
            type="text"
            id="grade"
            {...register('grade', { 
              maxLength: { value: 10, message: 'Grade must be less than 10 characters' }
            })}
            className="form-input"
            placeholder="A+, 3.8 GPA, etc."
          />
          {errors.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
          )}
        </div>

        {/* Metadata URI (Optional) */}
        <div>
          <label htmlFor="metadataUri" className="block text-sm font-medium text-gray-700">
            Metadata URI (Optional)
          </label>
          <input
            type="url"
            id="metadataUri"
            {...register('metadataUri', { 
              maxLength: { value: 300, message: 'URI must be less than 300 characters' }
            })}
            className="form-input"
            placeholder="https://example.com/metadata.json"
          />
          {errors.metadataUri && (
            <p className="mt-1 text-sm text-red-600">{errors.metadataUri.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Issuing Certificate...' : 'Issue Certificate'}</span>
          </button>
        </div>

        {/* Transaction Result */}
        {txId && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Certificate Issued Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Transaction ID: 
                    <a 
                      href={`https://explorer.stacks.co/txid/${txId}${network === 'testnet' ? '?chain=testnet' : ''}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 font-mono text-xs underline hover:text-green-900"
                    >
                      {txId}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}