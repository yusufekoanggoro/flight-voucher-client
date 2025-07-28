'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { FormState, CheckRequest, GenerateRequest, CheckResponse, GenerateResponse } from './types/form'

export default function Home() {
  const [form, setForm] = useState<FormState>({
    crewName: '',
    crewId: '',
    flightNumber: '',
    flightDate: new Date(),
    aircraftType: 'ATR',
  })

  const [seats, setSeats] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setForm({ ...form, flightDate: date })
    }
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(2)
    return `${day}-${month}-${year}`
  }

  const handleSubmit = async () => {
    setSeats([])
    setMessage('Checking...')

    const checkPayload: CheckRequest = {
      flightNumber: form.flightNumber,
      date: formatDate(form.flightDate),
    }

    const resCheck = await fetch('http://localhost:8080/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkPayload),
    })

    const check: CheckResponse = await resCheck.json()

    if (check.exists) {
      setMessage('A voucher for this flight already exists.')
    } else {
      const generatePayload: GenerateRequest = {
        name: form.crewName,
        id: form.crewId,
        flightNumber: form.flightNumber,
        date: formatDate(form.flightDate),
        aircraft: form.aircraftType,
      }

      const resGenerate = await fetch('http://localhost:8080/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatePayload),
      })

      if (!resGenerate.ok) {
        const errorData = await resGenerate.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Failed to create voucher.'
        setMessage(errorMessage)
        setSeats([])
        return
      }

      const data: GenerateResponse = await resGenerate.json()
      setSeats(data.seats || [])
      setMessage('Voucher created successfully!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Create Flight Voucher</h1>

        <input
          name="crewName"
          placeholder="Crew Name"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
        />
        <input
          name="crewId"
          placeholder="Crew ID"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
        />
        <input
          name="flightNumber"
          placeholder="Flight Number"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
        />

        <div>
          <label className="block mb-1 text-sm text-gray-700">Flight Date</label>
          <DatePicker
            selected={form.flightDate}
            onChange={handleDateChange}
            dateFormat="dd-MM-yy"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <select
          name="aircraftType"
          className="w-full px-4 py-2 border rounded-md"
          onChange={handleChange}
          value={form.aircraftType}
        >
          <option value="ATR">ATR</option>
          <option value="Airbus 320">Airbus 320</option>
          <option value="Boeing 737 Max">Boeing 737 Max</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Generate Vouchers
        </button>

        {message && <p className="text-center text-gray-700">{message}</p>}

        {seats.length > 0 && (
          <div className="text-center">
            <p className="font-semibold">Seats:</p>
            <ul className="space-y-1">
              {seats.map((seat, i) => (
                <li key={i} className="text-lg text-gray-800">{seat}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
