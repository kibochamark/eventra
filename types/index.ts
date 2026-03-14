// ─── Shared enums ───────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  banned: boolean;
  emailVerified: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = "DISPATCH" | "RETURN" | "REPAIR_IN" | "REPAIR_OUT" | "LOSS";

export type QuoteStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "INVOICED" | "CANCELLED";

export type ItemType = "RENTAL" | "SALE" | "SERVICE";

export type EventStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

// ─── API shapes ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  parentId: string | null;
  subCategories: Category[];
}

export interface AssetImage {
  id: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

export interface StockMovementImage {
  id: string;
  imageUrl: string;
  publicId: string;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  notes: string | null;
  eventId: string | null;
  createdAt: string;
  images: StockMovementImage[];
}

export interface Asset {
  id: string;
  name: string;
  sku: string | null;
  totalStock: number;
  unitsAvailable: number;
  unitsOnSite: number;
  unitsInRepair: number;
  baseRentalRate: number;
  metadata: Record<string, string> | null;
  category: {
    id: string;
    name: string;
    parent: { id: string; name: string } | null;
  };
  images: AssetImage[];
  stockMovements?: StockMovement[];
}

export interface Client {
  id: string;
  name: string;
  isCorporate: boolean;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  createdAt?: string;
  _count?: { quotes: number };
  quotes?: { id: string; quoteNumber: string; status: QuoteStatus }[];
}

export interface QuoteListItem {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  includeVat: boolean;
  globalDiscount: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  client: { id: string; name: string };
  _count: { items: number };
}

export interface QuoteItem {
  id: string;
  type: ItemType;
  description: string;
  quantity: number;
  rate: string;
  days: number;
  discountAmount: string;
  asset: { id: string; name: string; sku: string | null } | null;
}

export interface PaymentProof {
  id: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

export interface ServiceBucketItem {
  id: string;
  description: string;
  quantity: number;
  rate: string;
  total: string;
}

export interface ServiceBucket {
  id: string;
  items: ServiceBucketItem[];
}

export interface QuoteSummary {
  subtotal: string;
  discountAmount: string;
  discountedTotal: string;
  vatAmount: string;
  grandTotal: string;
}

export interface QuoteEvent {
  id: string;
  name: string;
  status: EventStatus;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  includeVat: boolean;
  globalDiscount: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  notes: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  client: { id: string; name: string; email: string | null; phone: string | null };
  items: QuoteItem[];
  paymentProofs: PaymentProof[];
  events: QuoteEvent[];
  serviceBucket: ServiceBucket | null;
  summary: QuoteSummary;
}

export interface EventDetail {
  id: string;
  name: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  status: EventStatus;
  quote?: QuoteListItem;
  serviceBucket?: ServiceBucket;
}
