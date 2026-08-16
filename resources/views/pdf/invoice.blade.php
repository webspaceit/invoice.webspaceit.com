<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Invoice {{ $invoice->invoice_number }}</title>
<style>
    @font-face {
        font-family: 'Arial';
        src: url('{{ storage_path("fonts/arial.ttf") }}') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'Arial';
        src: url('{{ storage_path("fonts/arialbd.ttf") }}') format('truetype');
        font-weight: bold;
        font-style: normal;
    }
    @font-face {
        font-family: 'Arial';
        src: url('{{ storage_path("fonts/ariali.ttf") }}') format('truetype');
        font-weight: normal;
        font-style: italic;
    }
    @font-face {
        font-family: 'Arial';
        src: url('{{ storage_path("fonts/arialbi.ttf") }}') format('truetype');
        font-weight: bold;
        font-style: italic;
    }
    @page { size: A4 portrait; margin: 8mm 20mm 8mm 20mm; }
    html, body {
        width: 100%;
        min-height: 100%;
    }
    body {
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 16px;
        color: #222;
        line-height: 1.55;
        margin: 0;
        padding: 0;
    }
    .header {
        display: table;
        width: 100%;
        border-bottom: 4px solid #032f44;
        padding: 15px 0 10px 0;
    }
    .header-left,
    .header-right {
        display: table-cell;
        vertical-align: top;
    }
    .header-left {
        width: 60%;
    }
    .header img { width: 180px; height: auto; }
    .header-right { text-align: right; width: 40%; }
    .header-right h1 {
        font-size: 40px;
        font-weight: 700;
        color: #032f44;
        margin: 0 0 4px 0;
    }
    .header-right .status {
        font-size: 19px;
        color: #0f7a18;
        margin: 0;
    }
    .info-grid {
        display: table;
        width: 100%;
        border-spacing: 6px 0;
        margin-top: 20px;
        margin-bottom:20px;
    }
    .info-grid .info-box {
        display: table-cell;
        border: 1px solid #ddd;
        padding: 5px 10px;
        width: 25%;
        vertical-align: top;
    }
    .info-grid-full .info-box { width: 50%; }
    .info-box.dark {
        background-color: #032f44;
        color: #fff;
    }
    .info-box .label {
        font-size: 15px;
        color: #222;
        font-family: Arial, Helvetica, sans-serif;
    }
    .info-box.dark .label { color: rgba(255,255,255,0.7); }
    .info-box .value {
        font-size: 15px;
        font-weight: 600;
        font-family: Arial, Helvetica, sans-serif;
    }
    .info-box.dark .value { color: #fff; }
    .section-title {
        background-color: #032f44;
        color: #fff;
        padding: 5px 10px;
        font-size: 20px;
        font-weight: 600;
        font-family: Arial, Helvetica, sans-serif;
    }
    .client-grid {
        display: table;
        width: 100%;
        border-spacing: 5px 0;
        margin-top: 20px;
        margin-bottom:20px;
    }
    .client-grid > div {
        display: table-cell;
        vertical-align: top;
        width: 50%;
    }
    .client-box {
        border: 1px solid #ddd;
        border-top: none;
        padding: 12px 16px;
        font-size: 13px;
        line-height: 1.1;
        font-family: Arial, Helvetica, sans-serif;
    }
    .client-box .name { font-weight: 600; font-family: Arial, Helvetica, sans-serif; }
    .table-section { margin-top: 10px;border-spacing: 10px 0; width: 98.5%; vertical-align:middle; margin-left:1%; }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }
    table, table th, table td {
        font-family: Arial, Helvetica, sans-serif;
    }
    table th {
        background-color: #f0f3f5;
        border: 1px solid #ddd;
        padding: 12px 16px;
        text-align: left;
    }
    table th.right { text-align: right;  }
    table th.center { text-align: center; }
    table td {
        border: 1px solid #ddd;
        padding: 12px 16px;
    }
    table td.right { text-align: right;font-size:15px; }
    table td.center { text-align: center; font-size:15px; }
    table td.bold { font-weight: 600; }
    table.detail-info th, table.detail-info td
    {font-size:16px; line-height:22px; padding-top:5px; padding-bottom:5px;}
    .totals {
        margin-top: 10px;
        width: 100%;
    }
    .totals-table {
        width: 320px;
        margin-left: auto;
    }
    .totals-table td {
        border: none;
        padding: 4px 6px;
        text-align: right;
        font-size: 17px;
		line-height:20px;
    }
    .totals-table td.label { text-align: left; padding: 4px 6px; }
    .totals-table tr.border-bottom td { border-bottom: 1px solid #eee; font-size:15px; }<br>
	 tr.border-bottom td.label{ 
    .totals-table .strong {
        font-weight: 700;
        color: #032f44;
        font-size:15px;
    }
    .note-section {
        margin-top: 30px;
        font-size: 14px;
        line-height: 1.2;
        margin-bottom: 30px;
        font-family: Arial, Helvetica, sans-serif;
    }
    .note-section .label { font-weight: 600; font-size: 16px; font-family: Arial, Helvetica, sans-serif; }
    .footer {
        margin-top: 14px;
        border-top: 2px solid #032f44;
        padding-top: 8px;
        display: table;
        width: 100%;
        border-spacing: 10px 0;
        font-size: 18px;
    }
    .footer .col {
        display: table-cell;
        vertical-align: top;
        line-height: 1.5;
        width: 50%;
    }
    .footer .col{
        
    }
    .footer .semibold { font-weight: 600; font-size: 15px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; }
    .footer div { font-size: 11px; font-family: Arial, Helvetica, sans-serif; }
    /* .footer .col.caddress{font-size:11px!important;} */
    .watermark-container {
        position: relative;
    }
    .watermark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 10;
    }
    .watermark-text {
        font-size: 120px;
        font-weight: 900;
        color: rgba(220, 38, 38, 0.25);
        transform: rotate(-30deg);
        text-transform: uppercase;
        letter-spacing: 20px;
    }
    .footer .thank-you {
        font-size: 32px;
        font-weight: 700;
        color: #0f7a18;
        margin: 0 0 4px 0;
        text-align: right;
    }
    .signature-block {
        margin-top: 10px;
        text-align: right;
    }
    .signature-img {
        max-height: 60px;
        max-width: 180px;
        display: block;
        margin-left: auto;
        margin-bottom: 0;
    }
    .signature-designation {
        font-size: 16px;
        font-weight: 600;
        color: #032f44;
        border-top: 1px solid #032f44;
        padding-top: 3px;
        margin-top: 4px;
        display: block;
        width: 180px;
        margin-left: auto;
        font-family: Arial, Helvetica, sans-serif;
    }
</style>
</head>
<body>

<div class="header">
    <div class="header-left">
        <img src="{{ public_path('images/web-space-it-logo.png') }}" alt="Web Space IT"/>
    </div>
    <div class="header-right">
        <h1>INVOICE</h1>
        <p class="status">{{ ucfirst($invoice->payment_status) }}</p>
        @if($invoice->paid_date)
        <p style="font-size:14px; color:#0f7a18; margin:2px 0 0 0; font-family:Arial, Helvetica, sans-serif;">
            Paid Date: {{ \Illuminate\Support\Carbon::parse($invoice->paid_date)->format('j-F-Y') }}
        </p>
        @endif
    </div>
</div>

<div class="info-grid @if($invoice->payment_status === 'paid') info-grid-full @endif">
    <div class="info-box">
        <div class="label">Invoice No.</div>
        <div class="value">{{ $invoice->invoice_number }}</div>
    </div>
    <div class="info-box">
        <div class="label">Invoice Date</div>
        <div class="value">{{ \Illuminate\Support\Carbon::parse($invoice->invoice_date)->format('j-F-Y') }}</div>
    </div>
    @if($invoice->payment_status !== 'paid')
    <div class="info-box">
        <div class="label">Due Date</div>
        <div class="value">{{ \Illuminate\Support\Carbon::parse($invoice->due_date)->format('j-F-Y') }}</div>
    </div>
    <div class="info-box dark">
        <div class="label">Amount Due</div>
        <div class="value">{{ number_format((float) $invoice->amount_due, 2) }} BDT</div>
    </div>
    @endif
</div>

<div class="client-grid">
    <div>
        <div class="section-title">Invoice For</div>
        <div class="client-box">
            <div class="name">{{ $invoice->client->name }}</div>
            @if($invoice->client->designation)<div>{{ $invoice->client->designation }}</div>@endif
            @if($invoice->client->company)<div>{{ $invoice->client->company }}</div>@endif
            @if($invoice->client->email)<div>{{ $invoice->client->email }}</div>@endif
            @if($invoice->client->phone)<div>{{ $invoice->client->phone }}</div>@endif
        </div>
    </div>
    <div>
        <div class="section-title">Billing Address</div>
        <div class="client-box" style="white-space: pre-line;">{{ $invoice->client->billing_address }}</div>
    </div>
</div>

<div class="@if($invoice->payment_status === 'paid') watermark-container @endif">
    <div class="table-section">
        <div class="section-title">Details Information</div>
        <table class="detail-info">
            <thead>
                <tr>
                    <th class="center" style="width:30px;">No.</th>
                    <th>Description</th>
                    <th class="right">Amount</th>
                    <th class="right">Qty.</th>
                    <th class="right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $index => $item)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="right">{{ number_format((float) $item->unit_amount, 2) }}</td>
                    <td class="right">{{ $item->quantity }}</td>
                    <td class="right bold">{{ number_format((float) $item->line_total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if($invoice->payment_status === 'paid')
    <div class="watermark">
        <div class="watermark-text">PAID</div>
    </div>
    @endif
</div>

<div class="totals">
    <table class="totals-table">
        <tr class="border-bottom">
            <td class="label">Sub Total</td>
            <td>{{ number_format((float) $invoice->subtotal, 2) }}</td>
        </tr>
        <tr class="border-bottom">
            <td class="label">Discount</td>
            <td>{{ number_format((float) $invoice->discount_amount, 2) }}</td>
        </tr>
        <tr class="border-bottom">
            <td class="label">Tax ({{ $invoice->tax_rate }}%)</td>
            <td>{{ number_format((float) $invoice->tax_amount, 2) }}</td>
        </tr>
        <tr class="border-bottom">
            <td class="label strong">Invoice Total</td>
            <td class="strong">{{ number_format((float) $invoice->invoice_total, 2) }}</td>
        </tr>
        <tr class="border-bottom">
            <td class="label">Total Paid</td>
            <td>{{ number_format((float) $invoice->total_paid, 2) }}</td>
        </tr>
        @if($invoice->paid_date)
        <tr class="border-bottom">
            <td class="label">Paid Date</td>
            <td>{{ \Illuminate\Support\Carbon::parse($invoice->paid_date)->format('j-F-Y') }}</td>
        </tr>
        @endif
        @if($invoice->payment_method && $invoice->payment_method !== 'Cheque')
        <tr class="border-bottom">
            <td class="label">Payment Method</td>
            <td>{{ $invoice->payment_method }}</td>
        </tr>
        @endif
        @if($invoice->actual_paid_amount !== null && $invoice->payment_method !== 'Cheque')
        <tr class="border-bottom">
            <td class="label">Actual Payment Received</td>
            <td>{{ number_format((float) $invoice->actual_paid_amount, 2) }}</td>
        </tr>
        @endif
        @if($invoice->payment_status !== 'paid')
        <tr>
            <td class="label strong">Amount Due</td>
            <td class="strong">{{ number_format((float) $invoice->amount_due, 2) }}</td>
        </tr>
        @endif
  </table>
</div>

@if($invoice->note)
<div class="note-section">
    <span class="label">Terms & Conditions: </span>{{ $invoice->note }}
</div>
@endif

<div class="footer">
    <div class="col caddress">
        <div class="semibold">Corporate Address:</div>
        <div>Web Space IT, House: 04, Road: 08, Block: L, Eastern Housing, Pallabi, Dhaka-1216, Bangladesh.</div>
        <div>Mobile: +88 01797476242, +88 01712974550</div>
        <div>Email: info@webspaceit.com, webspaceit@gmail.com</div>
        <div>Web: www.webspaceit.com</div>
    </div>
    <div class="col">
        <h3 class="thank-you">Thank You</h3>
        @if($invoice->signature || $invoice->signatory_designation)
        <div class="signature-block">
            @if($invoice->signature)
            <img src="{{ storage_path('app/public/' . $invoice->signature) }}" alt="Signature" class="signature-img"/>
            @endif
            @if($invoice->signatory_designation)
            <div class="signature-designation">{!! $invoice->signatory_designation !!}</div>
            @endif
        </div>
        @endif
    </div>
</div>

</body>
</html>
