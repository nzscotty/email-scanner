import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http } from 'msw'
import { App } from './App'

const server = setupServer(
  http.post('http://localhost:5000/api/EmailScanner', () => {
    return new Response(
      JSON.stringify({
        costCentre: 'DEV632',
        total: 35000,
        totalExcludingTax: 30434.78,
        salesTax: 4565.22,
        paymentMethod: 'personal card',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('App Component', () => {
  it('allows users to submit email text and displays scanned results', async () => {
    render(<App />)
    
    const textArea = screen.getByPlaceholderText(/paste your email text here/i)
    const submitButton = screen.getByText(/submit/i)
    
    const sampleEmail = `
      Hi Patricia,
      Please create an expense claim for the below. Relevant details are marked up as requested…
      <expense><cost_centre>DEV632</cost_centre><total>35,000</total><payment_method>personal card</payment_method></expense>
    `
    
    await userEvent.type(textArea, sampleEmail)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/scanned data/i)).toBeInTheDocument()
      expect(screen.getByText(/"costCentre": "DEV632"/)).toBeInTheDocument()
      expect(screen.getByText(/"total": 35000/)).toBeInTheDocument()
    })
  })

  it('shows error message when API returns an error', async () => {
    server.use(
      http.post('http://localhost:5000/api/EmailScanner', () => {
        return new Response(
          JSON.stringify({ error: 'Missing required <total> tag' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    
    render(<App />)
    
    const textArea = screen.getByPlaceholderText(/paste your email text here/i)
    const submitButton = screen.getByText(/submit/i)
    
    const invalidEmail = '<expense><cost_centre>DEV632</cost_centre></expense>'
    
    await userEvent.type(textArea, invalidEmail)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/missing required <total> tag/i)).toBeInTheDocument()
    })
  })

  it('clears the form when clear button is clicked', async () => {
    render(<App />)
    
    const textArea = screen.getByPlaceholderText(/paste your email text here/i)
    const clearButton = screen.getByText(/clear/i)
    
    await userEvent.type(textArea, 'Some test text')
    expect(textArea).toHaveValue('Some test text')
    
    fireEvent.click(clearButton)
    expect(textArea).toHaveValue('')
  })
})