import api from './api'

export interface DashboardStats {
  active_str_count: number
  monthly_imports: number
  active_dealers: number
  nominee_flags: number
}

export interface TrendPoint {
  date: string
  count: number
}

export interface TrendsData {
  imports: TrendPoint[]
  sales: TrendPoint[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/fiu/dashboard-stats')
  return response.data as DashboardStats
}

export async function getTrends(): Promise<TrendsData> {
  const response = await api.get('/fiu/trends')
  return response.data as TrendsData
}
