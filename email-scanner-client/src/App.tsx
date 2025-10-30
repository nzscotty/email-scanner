import { useState, useEffect } from 'react'
import './App.css'

interface EmailData {
  costCentre: string;
  total: number;
  totalExcludingTax: number;
  salesTax: number;
  paymentMethod?: string;
  vendor?: string;
  description?: string;
  date?: string;
}

interface ApiError {
  error: string;
}

interface HealthStatus {
  status: string;
  message: string;
}

export function App() {
  const [emailText, setEmailText] = useState('')
  const [scannedData, setScannedData] = useState<EmailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiHealth, setApiHealth] = useState<HealthStatus | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
  const response = await fetch('https://spooky-spooky-mummy-jvpqqxp479cq567-5000.app.github.dev/api/EmailScanner', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': 'https://spooky-spooky-mummy-jvpqqxp479cq567-5173.app.github.dev/'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('API health check failed');
        }

        const data = await response.json();
        setApiHealth(data as HealthStatus);
        setApiError(null);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'API is unreachable');
        setApiHealth(null);
      }
    };

    checkApiHealth();
  }, [])
  

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
  setScannedData(null)

    try {
  const response = await fetch('https://spooky-spooky-mummy-jvpqqxp479cq567-5000.app.github.dev/api/EmailScanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://spooky-spooky-mummy-jvpqqxp479cq567-5173.app.github.dev/'
        },
        mode: 'cors',
        body: JSON.stringify({ emailText }),
      })

      const data = await response.json()

      if (!response.ok) {
        const error = data as ApiError
        throw new Error(error.error)
      }

      setScannedData(data as EmailData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setEmailText('')
  setScannedData(null)
    setError(null)
  }

  return (
    <div className="container">
  <h1>Email Scanner</h1>
      
      {apiHealth && (
        <div className="api-status success">
          {apiHealth.message}
        </div>
      )}
      
      {apiError && (
        <div className="api-status error">
          API Error: {apiError}
        </div>
      )}
      
      <div className="input-section">
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder="Paste your email text here..."
          rows={10}
          className="email-input"
        />
        
        <div className="button-group">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !emailText.trim()}
            className="submit-button"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
          
          <button
            onClick={handleClear}
            className="clear-button"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {scannedData && (
        <div className="result-section">
          <h2>Scanned Data</h2>
          <pre className="json-output">
            {JSON.stringify(scannedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}