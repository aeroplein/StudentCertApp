'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  callReadOnlyFunction,
  cvToValue,
  uintCV
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { useWallet } from './WalletConnectButton';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Building,
  User,
  Award,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'certificate';

export default function VerifyCertificate() {
  const { network } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!CONTRACT_ADDRESS) {
      toast.error('Contract not deployed yet. Please check configuration.');
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    
    try {
      const stacksNetwork = network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
      
      // Call the verify-certificate read-only function
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'verify-certificate',
        functionArgs: [uintCV(parseInt(data.certificateId))],
        network: stacksNetwork,
        senderAddress: CONTRACT_ADDRESS
      });

      const resultValue = cvToValue(result);
      
      if (resultValue && typeof resultValue === 'object' && 'certificate' in resultValue) {
        setVerificationResult({
          success: true,
          data: resultValue
        });
        toast.success('Certificate verified successfully!');
      } else {
        setVerificationResult({
          success: false,
          error: 'Certificate not found'
        });
        toast.error('Certificate verification failed');
      }
      
    } catch (error) {
      console.error('Error verifying certificate:', error);
      let errorMessage = 'Verification failed';
      
      if (error.message.includes('NoSuchContract')) {
        errorMessage = 'Contract not found. Please check if it has been deployed.';
      } else if (error.message.includes('NoSuchPublicFunction')) {
        errorMessage = 'Verification function not found in contract.';
      }
      
      setVerificationResult({
        success: false,
        error: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Handle both seconds and milliseconds timestamps
      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      const date = ts > 10000000000 ? new Date(ts) : new Date(ts * 1000);
      return format(date, 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      {/* Verification Form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Verify Certificate</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700">
              Certificate ID *
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="certificateId"
                {...register('certificateId', { 
                  required: 'Certificate ID is required',
                  min: { value: 1, message: 'Certificate ID must be at least 1' }
                })}
                className="form-input flex-1 rounded-l-md rounded-r-none"
                placeholder="Enter certificate ID to verify"
              />
              <button
                type="submit"
                disabled={isLoading || !CONTRACT_ADDRESS}
                className="btn-primary rounded-l-none border-l-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.certificateId && (
              <p className="mt-1 text-sm text-red-600">{errors.certificateId.message}</p>
            )}
            {!CONTRACT_ADDRESS && (
              <p className="mt-1 text-sm text-yellow-600">
                ⚠️ Contract not configured. Please deploy the contract first.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="card">
          {verificationResult.success ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {verificationResult.data['is-valid'] ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="text-lg font-semibold text-green-700">Valid Certificate</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <span className="text-lg font-semibold text-red-700">
                        {verificationResult.data.certificate['is-revoked'] ? 'Revoked Certificate' : 'Invalid Certificate'}
                      </span>
                    </>
                  )}
                </div>
                
                {/* View on Explorer */}
                <a
                  href={`https://explorer.stacks.co/address/${CONTRACT_ADDRESS}${network === 'testnet' ? '?chain=testnet' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Contract</span>
                </a>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span>Certificate Details</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Title</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {verificationResult.data.certificate.title}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900">
                        {verificationResult.data.certificate.description}
                      </p>
                    </div>
                    
                    {verificationResult.data.certificate.grade && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Grade</label>
                        <p className="text-sm text-gray-900 font-medium">
                          {verificationResult.data.certificate.grade}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issue Date</label>
                      <p className="text-sm text-gray-900 flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatTimestamp(verificationResult.data.certificate['issue-date'])}</span>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Recipient</label>
                      <p className="text-sm text-gray-900 font-mono flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{formatAddress(verificationResult.data.certificate.recipient)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Institution Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    <span>Institution Details</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institution Name</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {verificationResult.data.institution.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institution Address</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {formatAddress(verificationResult.data.institution.address)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center space-x-2">
                        {verificationResult.data.institution['is-active'] ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="badge-success">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="badge-error">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata URI if available */}
              {verificationResult.data.certificate['metadata-uri'] && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500">Metadata</label>
                  <a
                    href={verificationResult.data.certificate['metadata-uri']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Additional Details</span>
                  </a>
                </div>
              )}

              {/* Warnings */}
              {(!verificationResult.data['is-valid'] || verificationResult.data.certificate['is-revoked']) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Certificate Verification Warning
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        {verificationResult.data.certificate['is-revoked'] && (
                          <p>• This certificate has been revoked by the issuing institution.</p>
                        )}
                        {!verificationResult.data.institution['is-active'] && (
                          <p>• The issuing institution is no longer active.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Error State */
            <div className="text-center py-6">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Failed</h3>
              <p className="mt-1 text-sm text-gray-500">
                {verificationResult.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { useWalletConnection } from './WalletConnectButton';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Building,
  User,
  Award,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// (Removed duplicate CONTRACT_ADDRESS and CONTRACT_NAME declarations)

export default function VerifyCertificate() {
  const { network } = useWalletConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setVerificationResult(null);
    
    try {
      const stacksNetwork = network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
      
      // Call the verify-certificate read-only function
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'verify-certificate',
        functionArgs: [
          { type: 'uint', value: parseInt(data.certificateId) }
        ],
        network: stacksNetwork,
        senderAddress: CONTRACT_ADDRESS
      });

      const resultValue = cvToValue(result);
      
      if (resultValue.success) {
        setVerificationResult({
          success: true,
          data: resultValue.value
        });
        toast.success('Certificate verified successfully!');
      } else {
        setVerificationResult({
          success: false,
          error: resultValue.error || 'Certificate not found'
        });
        toast.error('Certificate verification failed');
      }
      
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        success: false,
        error: error.message || 'Verification failed'
      });
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(Number(timestamp) * 1000), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      {/* Verification Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Verify Certificate</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700">
              Certificate ID *
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="certificateId"
                {...register('certificateId', { 
                  required: 'Certificate ID is required',
                  min: { value: 1, message: 'Certificate ID must be at least 1' }
                })}
                className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter certificate ID to verify"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:bg-indigo-400 transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.certificateId && (
              <p className="mt-1 text-sm text-red-600">{errors.certificateId.message}</p>
            )}
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {verificationResult.success ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {verificationResult.data.isValid ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="text-lg font-semibold text-green-700">Valid Certificate</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <span className="text-lg font-semibold text-red-700">
                        {verificationResult.data.certificate.isRevoked ? 'Revoked Certificate' : 'Invalid Certificate'}
                      </span>
                    </>
                  )}
                </div>
                
                {/* View on Explorer */}
                <a
                  href={`https://explorer.stacks.co/address/${CONTRACT_ADDRESS}${network === 'testnet' ? '?chain=testnet' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Contract</span>
                </a>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span>Certificate Details</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Title</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {verificationResult.data.certificate.title}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900">
                        {verificationResult.data.certificate.description}
                      </p>
                    </div>
                    
                    {verificationResult.data.certificate.grade && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Grade</label>
                        <p className="text-sm text-gray-900 font-medium">
                          {verificationResult.data.certificate.grade}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issue Date</label>
                      <p className="text-sm text-gray-900 flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatTimestamp(verificationResult.data.certificate.issueDate)}</span>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Recipient</label>
                      <p className="text-sm text-gray-900 font-mono flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{formatAddress(verificationResult.data.certificate.recipient)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Institution Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    <span>Institution Details</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institution Name</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {verificationResult.data.institution.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institution Address</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {formatAddress(verificationResult.data.institution.address)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center space-x-2">
                        {verificationResult.data.institution.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-700 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-700 font-medium">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata URI if available */}
              {verificationResult.data.certificate.metadataUri && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500">Metadata</label>
                  <a
                    href={verificationResult.data.certificate.metadataUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Additional Details</span>
                  </a>
                </div>
              )}

              {/* Warnings */}
              {(!verificationResult.data.isValid || verificationResult.data.certificate.isRevoked) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Certificate Verification Warning
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        {verificationResult.data.certificate.isRevoked && (
                          <p>• This certificate has been revoked by the issuing institution.</p>
                        )}
                        {!verificationResult.data.institution.isActive && (
                          <p>• The issuing institution is no longer active.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Error State */
            <div className="text-center py-6">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Failed</h3>
              <p className="mt-1 text-sm text-gray-500">
                {verificationResult.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}