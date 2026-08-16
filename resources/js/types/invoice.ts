export type Client = {
    id: number;
    name: string;
    company: string | null;
    designation: string | null;
    email: string | null;
    phone: string | null;
    billing_address: string;
    invoices_count?: number;
    users?: { id: number; name: string }[];
};

export type InvoiceItem = {
    id?: number;
    description: string;
    unit_amount: string;
    quantity: string;
    line_total?: string;
};

export type Invoice = {
    id: number;
    client_id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    paid_date: string | null;
    subtotal: string;
    discount_amount: string;
    tax_rate: string;
    tax_amount: string;
    invoice_total: string;
    total_paid: string;
    amount_due: string;
    payment_status: InvoiceStatus;
    note: string | null;
    signature: string | null;
    payment_slip: string | null;
    payment_method: string | null;
    actual_paid_amount: string | null;
    signatory_designation: string | null;
    client: Client;
    items: InvoiceItem[];
};

export type InvoiceStatus = 'draft' | 'unpaid' | 'partial' | 'paid' | 'overdue';

export type Paginated<T> = {
    data: T[];
};
