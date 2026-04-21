import api from './api'

export interface CvrDashboardStats {
  today_registrations: number
  monthly_registrations: number
  total_registrations: number
  pending_vehicles: number
}

export async function getCvrDashboardStats(): Promise<CvrDashboardStats> {
  const response = await api.get('/cvr/dashboard-stats')
  return response.data as CvrDashboardStats
}
