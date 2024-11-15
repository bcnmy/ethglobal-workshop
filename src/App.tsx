import { useState } from 'react';
import { createWalletClient, custom, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { crossChainMint, getKlasterBalance, initKlasterService } from './services/AbstractService';

function App() {
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const mint = async () => {
    try {
      setApiLoading(true);
      const result = await crossChainMint();
      alert(result.itxHash);
    } catch (err) {
      console.error('Mint failed with error: ', err);
      setError('Failed to mint an NFT');
    } finally {
      setApiLoading(false);
    }
  };

  const connectWallet = async () => {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    if (typeof (window as any).ethereum === 'undefined') {
      setError('Please install MetaMask to use this feature');
      return;
    }

    try {
      setLoading(true);
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const client = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum!)
      });
      const [address] = await client.requestAddresses();
      const klasterAddress = await initKlasterService(client, address);
      const balanceResponse = await getKlasterBalance();
      console.log("balance response", balanceResponse);
      setUsdcBalance(formatUnits(balanceResponse.balance, 6));
      setAccount(klasterAddress);
      setError("");
    } catch (err) {
      setError('Failed to connect to MetaMask');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center',
    marginBottom: '10px',
  };

  const apiButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#34a853',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.7,
    cursor: 'not-allowed',
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const infoBoxStyle = {
    padding: '16px',
    backgroundColor: '#e8f0fe',
    borderRadius: '4px',
    marginTop: '16px',
  };

  const errorStyle = {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginTop: '16px',
  };

  const loadingSpinner = (
    <div 
      style={{ 
        width: '16px', 
        height: '16px', 
        border: '2px solid #ffffff',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} 
    />
  );

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <button 
        onClick={connectWallet} 
        style={loading ? disabledButtonStyle : buttonStyle}
        disabled={loading}
      >
        {loading && loadingSpinner}
        {account ? 'Connected' : 'Connect MetaMask'}
      </button>

      <button 
        onClick={mint}
        style={apiLoading ? disabledButtonStyle : apiButtonStyle}
        disabled={apiLoading}
      >
        {apiLoading && loadingSpinner}
        Cross-chain Mint
      </button>

      {account && (
        <div style={infoBoxStyle}>
          <p style={{ marginBottom: '8px' }}>
            Connected Account: 
            <span style={{ fontFamily: 'monospace', marginLeft: '8px' }}>
              {`${account}`}
            </span>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            USDC Balance:
            {loading ? (
              <span style={{ display: 'inline-block' }}>{loadingSpinner}</span>
            ) : (
              <span style={{ fontFamily: 'monospace' }}>
                {usdcBalance !== null ? `$${usdcBalance}` : '---'}
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;