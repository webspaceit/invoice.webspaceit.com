import { formatDate, money, statusLabels } from '@/lib/invoice';
import type { Invoice } from '@/types/invoice';

type Props = {
    invoice: Invoice;
};

export function InvoiceDocument({ invoice }: Props) {
    return (
        <div className="bg-white text-[#222]">
            <Header invoice={invoice} />

            <section
                className={`mt-6 grid gap-2.5 ${invoice.payment_status === 'paid' ? 'grid-cols-2' : 'grid-cols-4'}`}
            >
                <InfoBox label="Invoice No." value={invoice.invoice_number} />
                <InfoBox label="Invoice Date" value={formatDate(invoice.invoice_date)} />
                {invoice.payment_status !== 'paid' && (
                    <>
                        <InfoBox label="Due Date" value={formatDate(invoice.due_date)} />
                        <InfoBox label="Amount Due" value={money(invoice.amount_due)} dark />
                    </>
                )}
            </section>

            <section className="mt-6 grid gap-5 text-sm md:grid-cols-2">
                <div>
                    <SectionTitle text="Invoice For" />
                    <div className="border border-t-0 p-3 leading-6">
                        <div className="font-semibold">{invoice.client.name}</div>
                        {invoice.client.company && <div>{invoice.client.company}</div>}
                        {invoice.client.email && <div>{invoice.client.email}</div>}
                        {invoice.client.phone && <div>{invoice.client.phone}</div>}
                    </div>
                </div>
                <div>
                    <SectionTitle text="Billing Address" />
                    <div className="whitespace-pre-line border border-t-0 p-3 leading-6">
                        {invoice.client.billing_address}
                    </div>
                </div>
            </section>

            <section className="mt-5">
                <SectionTitle text="Details Information" />
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#f0f3f5]">
                            <th className="border p-2 text-left">No.</th>
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-right">Amount</th>
                            <th className="border p-2 text-right">Qty.</th>
                            <th className="border p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id ?? index}>
                                <td className="border p-2 text-center">{index + 1}</td>
                                <td className="border p-2">{item.description}</td>
                                <td className="border p-2 text-right">
                                    {money(item.unit_amount)}
                                </td>
                                <td className="border p-2 text-right">{item.quantity}</td>
                                <td className="border p-2 text-right font-medium">
                                    {money(item.line_total!)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mt-4 flex justify-end">
                <div className="w-[300px] space-y-1.5 text-sm">
                    <TotalRow label="Sub Total" value={money(invoice.subtotal)} />
                    <TotalRow
                        label="Discount"
                        value={money(invoice.discount_amount)}
                    />
                    <TotalRow
                        label={`Tax (${invoice.tax_rate}%)`}
                        value={money(invoice.tax_amount)}
                    />
                    <TotalRow
                        label="Invoice Total"
                        value={money(invoice.invoice_total)}
                        strong
                    />
                    <TotalRow
                        label="Total Paid"
                        value={money(invoice.total_paid)}
                    />
                    <TotalRow
                        label="Amount Due"
                        value={money(invoice.amount_due)}
                        strong
                    />
                </div>
            </section>

            {invoice.note && (
                <section className="mt-4 text-sm leading-5">
                    <p>
                        <span className="font-semibold">Note: </span>
                        {invoice.note}
                    </p>
                </section>
            )}

            <Footer />
        </div>
    );
}

function Header({ invoice }: Props) {
    return (
        <header className="flex items-start justify-between border-b-4 border-[#032f44] pb-4">
            <img
                src="/images/web-space-it-logo.png"
                alt="Web Space IT"
                className="h-auto w-[220px]"
            />
            <div className="text-right">
                <h1 className="text-4xl font-bold tracking-normal text-[#032f44]">
                    INVOICE
                </h1>
                <p className="mt-1.5 text-sm text-[#0f7a18]">
                    {statusLabels[invoice.payment_status]}
                </p>
            </div>
        </header>
    );
}

function InfoBox({
    label,
    value,
    dark = false,
}: {
    label: string;
    value: string;
    dark?: boolean;
}) {
    return (
        <div className={dark ? 'bg-[#032f44] text-white' : 'border'}>
            <div
                className={
                    dark
                        ? 'px-2.5 pt-1.5 text-xs text-white/80'
                        : 'px-2.5 pt-1.5 text-xs text-gray-500'
                }
            >
                {label}
            </div>
            <div className="px-2.5 pb-1.5 text-sm font-semibold">{value}</div>
        </div>
    );
}

function SectionTitle({ text }: { text: string }) {
    return (
        <h2 className="bg-[#032f44] px-3 py-1.5 text-sm font-semibold text-white">
            {text}
        </h2>
    );
}

function TotalRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between border-b pb-1 ${strong ? 'font-bold text-[#032f44]' : ''
                }`}
        >
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

function Footer() {
    return (
        <footer className="mt-8 grid gap-5 border-t-2 border-[#032f44] pt-4 text-xs md:grid-cols-2">
            <div className="leading-5">
                <p className="font-semibold">Corporate Address:</p>
                <p>
                    Web Space IT, House: 04, Road: 08, Block: L, Eastern
                    Housing, Pallabi, Dhaka-1216, Bangladesh.
                </p>
                <p>Mobile: +88 01797476242, +88 01712974550</p>
                <p>Email: info@webspaceit.com, webspaceit@gmail.com</p>
                <p>Web: www.webspaceit.com</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-[#0f7a18]">
                    Thank You
                </h3>
            </div>
        </footer>
    );
}
