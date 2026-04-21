import api from './api'

export interface AdminDashboardStats {
  total_users: number
  total_dealers: number
  active_dealers: number
  suspended_dealers: number
  total_vehicles: number
  total_sales: number
  recent_audit_count: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get('/admin/dashboard-stats')
  return response.data as AdminDashboardStats
}
