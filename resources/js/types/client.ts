export type Client = {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
};

export type ClientWithAssign = Client & {
    pivot?: { user_id: number; client_id: number };
};
