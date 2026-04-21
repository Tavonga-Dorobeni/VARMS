import api from './api'

export interface DealerDashboardStats {
  inventory_count: number
  sold_count: number
  registered_count: number
  total_sales_value: number
  monthly_sales_value: number
  recent_sales: {
    id: number
    buyer_full_name: string
    sale_price: number
    sale_date: string
    vehicle_vin: string
  }[]
}

export async function getDealerDashboardStats(dealerId: number): Promise<DealerDashboardStats> {
  const response = await api.get(`/dealers/${dealerId}/dashboard-stats`)
  return response.data as DealerDashboardStats
}
