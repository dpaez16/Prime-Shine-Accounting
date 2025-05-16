export type WaveProduct = {
  id: string;
  name: string;
};

export type WaveCost = {
  value: string | number;
}

export type WaveInvoiceItem = {
  description: string;
  product: WaveProduct;
  total: WaveCost;
  uuid?: string;
};

export type WaveInvoice = {
  amountDue: WaveCost;
  amountPaid: WaveCost;
  createdAt: string; // Date Timestamp
  customer: {
    id: string;
    name: string;
  };
  id: string;
  invoiceDate: string;
  invoiceNumber: string;
  items: WaveInvoiceItem[];
  memo: string;
  modifiedAt: string; // Date Timestamp
  pdfUrl: string;
  status: string;
  total: WaveCost;
  uuid: string;
  viewUrl: string;
};
