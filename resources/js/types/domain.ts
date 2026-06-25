export type Domain = {
    id: number;
    client_id: number;
    domain_name: string;
    domain_registered_email: string | null;
    domain_registrar_link: string | null;
    hosting_provider: string | null;
    hosting_registration_date: string | null;
    hosting_expiry_date: string | null;
    registration_date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'pending';
    computed_status: 'active' | 'expired' | 'pending' | 'expiring_soon';
    client?: { id: number; name: string; company: string | null; email: string | null; phone: string | null };
};
