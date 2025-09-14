# StudentCertDApp 🎓

A blockchain-based student identity and educational certificate verification platform built on Stacks blockchain using Clarity smart contracts. Universities and course providers can mint certificates as NFT-like structures, students hold them in their wallets, and third parties (employers) can easily verify certificate authenticity.

## 🌟 Features

- **Decentralized Certificate Issuance**: Universities can issue tamper-proof digital certificates
- **Instant Verification**: Employers and institutions can verify certificates in real-time
- **Blockchain Security**: Built on Stacks blockchain with Clarity smart contracts
- **Wallet Integration**: Support for Hiro Wallet and Xverse
- **Institutional Registry**: Verified institutions can issue certificates
- **Certificate Revocation**: Institutions can revoke certificates if needed
- **Modern UI**: Responsive Next.js frontend with TailwindCSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Frontend (Next.js)              │
│  ┌─────────────────┐ ┌─────────────────┐       │
│  │ Verify Certs    │ │ Issue Certs     │       │
│  └─────────────────┘ └─────────────────┘       │
│           │                     │               │
│           └─────────┬───────────┘               │
└─────────────────────┼───────────────────────────┘
                      │
            ┌─────────▼─────────┐
            │   Stacks.js APIs  │
            │ (@stacks/connect) │
            └─────────┬─────────┘
                      │
    ┌─────────────────▼─────────────────┐
    │        Stacks Blockchain          │
    │  ┌─────────────────────────────┐  │
    │  │    Certificate Contract     │  │
    │  │     (Clarity Smart          │  │
    │  │      Contract)              │  │
    │  └─────────────────────────────┘  │
    └───────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Clarinet](https://docs.hiro.so/clarinet/getting-started) for smart contract development
- A Stacks wallet (Hiro Wallet or Xverse)

### Installation

1. **Clone and setup the project**
   ```bash
   git clone https://github.com/your-org/StudentCertDApp.git
   cd StudentCertDApp
   
   # Install all dependencies (root and frontend)
   npm run setup
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example frontend/.env.local
   
   # Edit with your configuration
   nano frontend/.env.local
   ```

3. **Deploy Smart Contract**
   ```bash
   # Generate a new keypair for deployment
   npx @stacks/cli make_keychain -t
   
   # Set your private key
   export DEPLOYER_PRIVATE_KEY="your_generated_private_key"
   export STACKS_NETWORK="testnet"
   
   # Deploy the contract
   npm run deploy
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
StudentCertDApp/
├── contracts/
│   └── certificate.clar              # Main smart contract
├── frontend/
│   ├── app/                          # Next.js 13+ app directory
│   ├── components/
│   │   ├── WalletConnectButton.jsx   # Wallet connection
│   │   ├── IssueCertificateForm.jsx  # Certificate issuance
│   │   └── VerifyCertificate.jsx     # Certificate verification
│   ├── styles/
│   │   └── globals.css               # Global styles + Tailwind
│   ├── public/
│   └── package.json
├── scripts/
│   ├── deploy.sh                     # Deployment script
│   └── deploy.ts                     # TypeScript deployment
├── tests/
│   └── certificate_test.ts           # Clarinet tests
├── deployments/                      # Deployment artifacts
├── clarinet.toml                     # Clarinet configuration
├── .env.example                      # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet # or mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Deployment (for deploy scripts)
DEPLOYER_PRIVATE_KEY=your_private_key_here
REGISTER_SAMPLE_INSTITUTION=true

# Optional: API endpoints
NEXT_PUBLIC_STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
```

### Clarinet Configuration

The `Clarinet.toml` file configures the local development environment:

```toml
[project]
name = "studentcertdapp"
requirements = []
telemetry = true
cache_dir = "./.clarinet/cache"
boot_contracts = ["certificate"]

[contracts.certificate]
path = "contracts/certificate.clar"

[repl.analysis]
passes = ["check_checker"]

[repl.analysis.check_checker]
strict = false
trusted_sender = false
trusted_caller = false
```

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all Clarinet tests
clarinet test

# Run specific test
clarinet test --filter certificate_test

# Interactive testing
clarinet console
```

### Frontend Tests

```bash
cd frontend

# Run Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚢 Deployment

### Smart Contract Deployment

1. **Set up environment variables**
   ```bash
   export DEPLOYER_PRIVATE_KEY="your_private_key"
   export STACKS_NETWORK="testnet" # or mainnet
   ```

2. **Deploy using script**
   ```bash
   # Using bash script
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh

   # Or using TypeScript
   npx ts-node scripts/deploy.ts
   ```

3. **Verify deployment**
   The script will output the contract address and transaction ID. Update your frontend environment variables accordingly.

### Frontend Deployment

Deploy to Vercel, Netlify, or any hosting platform:

```bash
cd frontend

# Build the application
npm run build

# Deploy (example for Vercel)
npx vercel --prod
```

## 📖 Smart Contract API

### Write Functions (Require Transaction)

#### `register-institution`
Register a new educational institution.
- **Parameters**: `name: string-ascii(100)`, `institution-address: principal`
- **Caller**: Contract owner only
- **Returns**: `(response uint uint)` - Institution ID

#### `issue-certificate`
Issue a new certificate to a recipient.
- **Parameters**: 
  - `recipient: principal`
  - `institution-id: uint`
  - `title: string-ascii(200)`
  - `description: string-ascii(500)`
  - `metadata-uri: optional(string-ascii(300))`
  - `grade: optional(string-ascii(10))`
- **Caller**: Registered institution only
- **Returns**: `(response uint uint)` - Certificate ID

#### `revoke-certificate`
Revoke an existing certificate.
- **Parameters**: `certificate-id: uint`
- **Caller**: Issuing institution only
- **Returns**: `(response bool uint)`

#### `deactivate-institution`
Deactivate an institution (prevents new certificate issuance).
- **Parameters**: `institution-id: uint`
- **Caller**: Contract owner only
- **Returns**: `(response bool uint)`

### Read-Only Functions

#### `verify-certificate`
Verify a certificate's authenticity and status.
- **Parameters**: `certificate-id: uint`
- **Returns**: Certificate data, institution info, and validity status

#### `get-certificate`
Get certificate details by ID.
- **Parameters**: `certificate-id: uint`
- **Returns**: `(optional certificate-data)`

#### `get-institution`
Get institution details by ID.
- **Parameters**: `institution-id: uint`
- **Returns**: `(optional institution-data)`

#### `owns-certificate`
Check if an address owns a specific certificate.
- **Parameters**: `owner: principal`, `certificate-id: uint`
- **Returns**: `bool`

#### `get-contract-info`
Get contract statistics and metadata.
- **Returns**: Total certificates, institutions, and contract owner info

## 🎯 Usage Examples

### For Educational Institutions

1. **Register your institution** (requires contract owner approval)
2. **Issue certificates** to students upon course completion
3. **Revoke certificates** if necessary (fraud, etc.)

```javascript
// Issue a certificate
const txOptions = {
  contractAddress: 'ST1ABC...',
  contractName: 'certificate',
  functionName: 'issue-certificate',
  functionArgs: [
    principalCV('SP1STUDENT...'),
    uintCV(1), // institution-id
    stringAsciiCV('Bachelor of Computer Science'),
    stringAsciiCV('Completed 4-year program with excellence'),
    someCV(stringAsciiCV('https://university.edu/metadata/123')),
    someCV(stringAsciiCV('3.8 GPA'))
  ]
};
```

### For Employers/Verifiers

1. **Enter certificate ID** in the verification interface
2. **Review certificate details** and institution information
3. **Check validity status** (not revoked, institution active)

### For Students

1. **Connect wallet** to view your certificates
2. **Share certificate IDs** with potential employers
3. **Keep wallet secure** as it holds your credentials

## 🔒 Security Features

- **Authorization Control**: Only registered institutions can issue certificates
- **Input Validation**: String length limits and format validation
- **Revocation System**: Institutions can revoke compromised certificates
- **Institution Management**: Contract owner can deactivate malicious institutions
- **Tamper-Proof Storage**: All data stored immutably on blockchain

## 🛡️ Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 100 | ERR_NOT_AUTHORIZED | Caller not authorized for this action |
| 101 | ERR_CERTIFICATE_NOT_FOUND | Certificate ID does not exist |
| 102 | ERR_ALREADY_EXISTS | Institution or certificate already exists |
| 103 | ERR_INVALID_INPUT | Invalid input parameters |
| 104 | ERR_INSTITUTION_NOT_REGISTERED | Institution not found or inactive |
| 105 | ERR_CERTIFICATE_REVOKED | Certificate has been revoked |
| 106 | ERR_INVALID_RECIPIENT | Invalid recipient address |

## 🧩 Integration Guide

### Frontend Integration

1. **Install Stacks.js dependencies**
   ```bash
   npm install @stacks/connect @stacks/transactions @stacks/network
   ```

2. **Connect wallet and call contract functions**
   ```javascript
   import { openContractCall } from '@stacks/connect';
   import { stringAsciiCV, uintCV } from '@stacks/transactions';
   
   const verifyCredential = async (certId) => {
     const result = await callReadOnlyFunction({
       contractAddress: CONTRACT_ADDRESS,
       contractName: 'certificate',
       functionName: 'verify-certificate',
       functionArgs: [uintCV(certId)],
       network: new StacksTestnet()
     });
     return result;
   };
   ```

### Backend Integration

For applications needing server-side verification:

```javascript
import { callReadOnlyFunction } from '@stacks/transactions';

const verifyCertificateServer = async (certificateId) => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: process.env.CONTRACT_ADDRESS,
      contractName: 'certificate',
      functionName: 'verify-certificate',
      functionArgs: [uintCV(certificateId)],
      network: new StacksTestnet(),
      senderAddress: process.env.CONTRACT_ADDRESS
    });
    
    return cvToValue(result);
  } catch (error) {
    console.error('Verification failed:', error);
    return null;
  }
};
```

## 📊 Monitoring & Analytics

### Transaction Monitoring

Monitor contract events using Stacks blockchain explorers:
- **Testnet**: https://explorer.stacks.co/?chain=testnet
- **Mainnet**: https://explorer.stacks.co

### Key Metrics to Track

- Total certificates issued
- Verification requests per day
- Active institutions
- Certificate revocation rate
- Network transaction costs

## 🔄 Upgrade Path

For contract upgrades, consider:

1. **Deploy new contract version**
2. **Migrate institution registrations**
3. **Update frontend to use new contract**
4. **Maintain backwards compatibility for existing certificates**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/JavaScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design for UI components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Stacks.js Docs](https://docs.hiro.so/stacks.js)
- **Community**: [Stacks Discord](https://discord.gg/stacks)
- **Issues**: [GitHub Issues](https://github.com/your-org/StudentCertDApp/issues)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic certificate issuance and verification
- ✅ Institution management
- ✅ Web interface with wallet integration

### Phase 2 (Planned)
- 🔲 Mobile app (React Native)
- 🔲 Batch certificate operations
- 🔲 Integration with university systems
- 🔲 Advanced search and filtering

### Phase 3 (Future)
- 🔲 Cross-chain compatibility
- 🔲 AI-powered fraud detection
- 🔲 Decentralized governance
- 🔲 Marketplace for verified skills

## ⚡ Performance Tips

### Smart Contract Optimization
- Use efficient map lookups
- Minimize transaction size
- Batch operations when possible

### Frontend Optimization
- Implement pagination for certificate lists
- Cache verification results
- Use React.memo for expensive components
- Optimize wallet connection handling

### Network Considerations
- **Testnet**: Free transactions, faster development
- **Mainnet**: Production use, transaction costs apply
- Consider transaction fee optimization for bulk operations

---

**Built with ❤️ on Stacks Blockchain**

For questions or support, please [open an issue](https://github.com/your-org/StudentCertDApp/issues) or join our community discussions.