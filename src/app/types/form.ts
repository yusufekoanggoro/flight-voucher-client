export type AircraftType = 'ATR' | 'Airbus 320' | 'Boeing 737 Max';

export interface FormState {
  crewName: string
  crewId: string
  flightNumber: string
  flightDate: Date
  aircraftType: AircraftType
}

export interface CheckRequest {
  flightNumber: string
  date: string // format: "dd-MM-yy"
}

export interface GenerateRequest {
  name: string
  id: string
  flightNumber: string
  date: string // format: "dd-MM-yy"
  aircraft: AircraftType
}

export interface CheckResponse {
  exists: boolean
}

export interface GenerateResponse {
  seats: string[]
}
