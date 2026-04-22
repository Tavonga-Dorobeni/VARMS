import type {
  DealerStatus,
  VehicleStatus,
  PaymentType,
  StrSeverity,
  StrStatus,
  RegistrationStatus,
  AuditAction,
  UserRole,
  UserStatus,
} from './enums'

export interface Dealer {
  id: number
  name: string
  license_number: string
  status: DealerStatus
  address: string
  contact_info: string
  approved_at: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  full_name: string
  role: UserRole
  agency: string
  username: string
  dealership_id: number | null
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: number
  vin: string
  make: string
  model: string
  declared_value: number
  country_of_origin: string
  import_date: string
  dealership_id: number
  status: VehicleStatus
  created_at: string
  updated_at: string
  dealership?: Dealer
  import_records?: ImportRecord[]
  sales?: SaleTransaction[]
  registrations?: RegistrationRecord[]
}

export interface ImportRecord {
  id: number
  vehicle_id: number
  officer_id: number
  border_post: string
  timestamp: string
  created_at: string
  updated_at: string
  officer?: User
  vehicle?: Vehicle
}

export interface Buyer {
  id: number
  full_name: string
  national_id: string
  contact_details: string
  created_at: string
  updated_at: string
}

export interface SaleTransaction {
  id: number
  vehicle_id: number
  dealership_id: number
  buyer_id: number
  sale_price: number
  payment_type: PaymentType
  proof_of_payment: string
  sale_date: string
  is_acting_for_another: boolean
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  dealership?: Dealer
  buyer?: Buyer
}

export interface BeneficialOwner {
  id: number
  linked_buyer_id: number
  full_name: string
  national_id: string
  relationship_type: string
  created_at: string
  updated_at: string
}

export interface StrAlert {
  id: number
  alert_type: string
  source_record_id: number
  source_entity_type: string
  reason: string
  severity: StrSeverity
  status: StrStatus
  vehicle_id: number | null
  dealership_id: number | null
  buyer_id: number | null
  transaction_value: number | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  dealership?: Dealer
  buyer?: Buyer
}

export interface RegistrationRecord {
  id: number
  vehicle_id: number
  buyer_id: number
  officer_id: number
  registration_date: string
  status: RegistrationStatus
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  buyer?: Buyer
  officer?: User
}

export interface AuditLog {
  id: number
  user_id: number
  role: string
  action: AuditAction
  entity_type: string
  entity_id: number
  before_value: Record<string, unknown> | null
  after_value: Record<string, unknown> | null
  reason: string | null
  timestamp: string
  created_at: string
  user?: User
}
