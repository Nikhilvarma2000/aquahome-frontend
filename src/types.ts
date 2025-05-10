// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "franchise_owner" | "service_agent" | "customer";
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: string;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rentalPrice: number;
  installationCharge: number;
  maintenanceFrequency: number;
  imageUrl: string;
  features: string[];
  specifications: { [key: string]: string };
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order related types
export interface Order {
  id: number;
  userId: number;
  productId: number;
  franchiseId?: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  orderType: "purchase" | "rental";
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  deliveryAddress: string;
  deliveryDate?: string;
  product?: Product;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Subscription related types
export interface Subscription {
  id: number;
  userId: number;
  productId: number;
  franchiseId?: number;
  status: "active" | "inactive" | "paused" | "cancelled";
  startDate: string;
  endDate?: string;
  renewalDate: string;
  monthlyFee: number;
  paymentStatus: "pending" | "paid" | "failed";
  product?: Product;
  maintenanceSchedule?: MaintenanceSchedule[];
  createdAt: string;
  updatedAt: string;
}

// Service related types
export interface ServiceRequest {
  id: number;
  userId: number;
  subscriptionId: number;
  franchiseId?: number;
  agentId?: string;
  type: "maintenance" | "repair" | "installation" | "removal";
  status: "pending" | "assigned" | "scheduled" | "completed" | "cancelled";
  description: string;
  scheduledDate?: string;
  completionDate?: string;
  feedback?: string;
  rating?: number;
  subscription?: Subscription;
  user?: User;
  agent?: User;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceSchedule {
  id: number;
  subscriptionId: string;
  scheduledDate: string;
  status: "pending" | "completed" | "missed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Franchise related types
export interface Franchise {
  isActive: any;
  id: number;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  serviceArea: string[];
  coverageRadius: number;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

// Activity related types
export interface Activity {
  id: string;
  type: "order" | "payment" | "service" | "subscription";
  title: string;
  description: string;
  date: string;
}

// Payment related types
export interface Payment {
  id: string;
  userId: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  status: "pending" | "success" | "failed";
  method: "card" | "netbanking" | "upi" | "wallet";
  transactionId?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard data types
export interface CustomerDashboardData {
  user?: User;
  activeSubscriptions?: Subscription[];
  pendingOrders?: Order[];
  activeServiceRequests?: ServiceRequest[];
  recentActivity?: Activity[];
}

export interface FranchiseDashboardData {
  franchise?: Franchise;
  pendingOrders?: Order[];
  activeSubscriptions?: Subscription[];
  pendingServiceRequests?: ServiceRequest[];
  recentActivity?: Activity[];
  stats?: {
    totalCustomers: number;
    totalOrders: number;
    activeSubscriptions: number;
    pendingServiceRequests: number;
  };
}

export interface AdminDashboardData {
  stats?: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    activeSubscriptions: number;
    pendingServiceRequests: number;
    franchiseApplications: number;
  };
}

export interface ServiceAgentDashboardData {
  assignedTasks?: ServiceRequest[];
  completedTasks?: ServiceRequest[];
  upcomingSchedule?: ServiceRequest[];
  stats?: {
    pendingTasks: number;
    completedTasks: number;
    totalCustomers: number;
  };
}

// Water Quality Data
export interface WaterQualityData {
  ph: number;
  tds: number;
  turbidity: number;
  hardness: number;
  chlorine: number;
  lastUpdated: string;
  recommendations?: string[];
  healthScore: number;
}

export interface WaterQualityHistory {
  date: string;
  healthScore: number;
  tds: number;
  ph: number;
}
