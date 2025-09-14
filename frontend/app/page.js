import App from '@/components/Layout';
import '../styles/globals.css';

export const metadata = {
  title: 'StudentCertDApp - Blockchain Certificate Verification',
  description: 'Verify educational certificates on the blockchain using Stacks and Clarity smart contracts',
  keywords: 'blockchain, certificates, education, verification, stacks, clarity',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function Page() {
  return <App />;
}