import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Printer, ArrowLeft } from "lucide-react";

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
        } else {
          console.error("No such order!");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-6">Loading Invoice...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculations
  const shippingCost = 9;
  const totalAmount = parseFloat(order.totalAmount || 0);
  const subtotal = (totalAmount - shippingCost).toFixed(2);
  const taxRate = 0.05; // Example 5%
  const taxAmount = (subtotal * taxRate).toFixed(2);

  // Styling constants (use a simple class name so CSS works without Tailwind)
  const grayBarClass = "gray-bar";

  return (
    <div className="invoice-page bg-white min-h-screen p-8 text-sm font-serif text-gray-900">
      <div className="no-print mb-8 flex gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:opacity-80 transition"
        >
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="max-w-4xl mx-auto" id="invoice-print-area">
        {/* HEADER BLOCK - updated to match example: logo left, title center, company info right */}
        <div className="flex justify-between items-start mb-6">
          {/* Logo Left (place logo at admin/public/logo-amirthaa.png) */}
          <div className="w-1/3 flex items-start">
            <img
              src="/logo-amirthaa.png"
              alt="Company Logo"
              style={{ maxWidth: 140, maxHeight: 60, objectFit: "contain" }}
            />
          </div>

          {/* Title Center */}
          <div className="w-1/3 text-center">
            <h1
              className="text-4xl font-bold text-gray-700 tracking-widest uppercase"
              style={{ fontFamily: "serif" }}
            >
              INVOICE
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              Invoice for Sales and Billing
            </div>
          </div>

          {/* Company Info Right */}
          <div className="w-1/3 text-right text-xs">
            <h3 className="font-bold text-sm mb-1">Amirthaa</h3>
            <p>Minit Engineers India Pvt. Ltd.</p>
            <p>138/5 Nasiyanur Road</p>
            <p>Semampalayam, Villarasampatti</p>
            <p>Erode - 638 107, Tamil Nadu, India</p>
            <p>Phone: +91 42 2464 1900</p>
            <p>Email: customercare@amirthaa.com</p>
          </div>
        </div>

        {/* ORDER META TABLE (PO, Ship Via, FOB, Terms, Salesperson, Dates) */}
        <div className="mb-6" style={{ border: "1px solid #d1d5db" }}>
          <div className="meta-grid text-xs text-gray-700">
            <div className={grayBarClass}>P.O. Number</div>
            <div>{order.poNumber || "N/A"}</div>
            <div className={grayBarClass}>Ship Via</div>
            <div>{order.shipVia || "N/A"}</div>

            <div className={grayBarClass}>F.O.B.</div>
            <div>{order.fob || "Your dock"}</div>
            <div className={grayBarClass}>Terms</div>
            <div>{order.terms || "Net 30 days"}</div>

            <div className={grayBarClass}>Salesperson</div>
            <div>{order.salesperson || "Online"}</div>
            <div className={grayBarClass}>Order Date</div>
            <div>{formatDate(order.orderDate || order.createdAt)}</div>

            <div className={grayBarClass}>Order Number</div>
            <div>{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</div>
            <div className={grayBarClass}>Invoice Number</div>
            <div>{order.invoiceNumber || order.id.toUpperCase()}</div>
          </div>
        </div>

        {/* BILL TO & LOCATION */}
        <div className="flex gap-8 mb-8">
          {/* Bill To */}
          <div className="w-1/2">
            <div className={`${grayBarClass} mb-2`}>BILL TO</div>
            <div className="pl-4 text-sm leading-relaxed">
              <p className="font-bold">{order.customerName}</p>
              <p className="whitespace-pre-line">{order.address}</p>
              <p>Phone: {order.phone}</p>
              <p>{order.userEmail}</p>
            </div>
          </div>

          {/* Location (Ship To) */}
          <div className="w-1/2">
            <div className={`${grayBarClass} mb-2`}>LOCATION</div>
            <div className="pl-4 text-sm leading-relaxed text-center">
              <p className="font-bold">{order.customerName}</p>
              <p className="whitespace-pre-line">{order.address}</p>
              <p>Phone: {order.phone}</p>
            </div>
          </div>
        </div>

        {/* PARTS AND MATERIALS TABLE */}
        <div className="mb-8">
          <div className={`${grayBarClass} text-left pl-4 py-2`}>
            PARTS AND MATERIALS (ITEMS)
          </div>
          <table className="invoice-table w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="py-2 px-4 text-left uppercase text-xs font-bold w-20">
                  ITEM NO
                </th>
                <th className="py-2 px-4 text-left uppercase text-xs font-bold">
                  DESCRIPTION
                </th>
                <th className="py-2 px-4 text-right uppercase text-xs font-bold w-24">
                  QTY
                </th>
                <th className="py-2 px-4 text-right uppercase text-xs font-bold w-28">
                  UNIT PRICE
                </th>
                <th className="py-2 px-4 text-right uppercase text-xs font-bold w-32">
                  EXT PRICE
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items &&
                order.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-sm">
                      {item.name}
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      {parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              {/* Empty Rows Filler */}
              {[...Array(Math.max(0, 6 - (order.items?.length || 0)))].map(
                (_, i) => (
                  <tr key={`spacer-${i}`}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER TOTALS */}
        <div className="flex flex-col items-end">
          <div className="w-1/3 min-w-[300px]">
            <div className="flex justify-between py-1 px-2">
              <span className="font-bold text-xs uppercase">NET AMOUNT</span>
              <span>{parseFloat(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 px-2">
              <span className="font-bold text-xs uppercase">Discount</span>
              <span>{(order.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 px-2">
              <span className="font-bold text-xs uppercase">Freight</span>
              <span>{(order.freight || shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 px-2 border-b border-gray-300">
              <span className="font-bold text-xs uppercase">H.S.T. / TAX</span>
              <span>{taxAmount}</span>
            </div>

            <div className="flex mt-2 border border-gray-600">
              <div className="w-2/3 bg-gray-600 text-white font-bold uppercase p-2 text-left">
                TOTAL DUE
              </div>
              <div className="w-1/3 bg-white font-bold p-2 text-right border-l border-gray-600">
                {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM MESSAGE */}
        <div className="mt-12 text-center text-xs font-bold italic text-gray-500">
          THANK YOU FOR YOUR BUSINESS!
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body {
             background: white;
             -webkit-print-color-adjust: exact;
          }
          .invoice-page {
             padding: 0;
             margin: 0;
             background: white;
          }
          #invoice-print-area {
             box-shadow: none;
             max-width: 100%;
             width: 100%;
             padding: 40px;
             margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }

        /* Fallback styles if Tailwind isn't available: visible table/grid borders */
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .invoice-table th, .invoice-table td { border: 1px solid #d1d5db; padding: 8px; }
        .invoice-table thead th { background: #f3f4f6; font-weight: 700; text-transform: uppercase; font-size: 12px; }
        .invoice-table td { font-size: 13px; vertical-align: top; }

        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .meta-grid > div { border-right: 1px solid #e5e7eb; padding: 8px; display:flex; align-items:center; justify-content:center; }
        .meta-grid > div:nth-child(4n) { border-right: none; }

        .gray-bar { background: #374151; color: #ffffff; font-weight: 700; text-transform: uppercase; padding: 6px 8px; text-align: center; font-size: 12px; }

        /* Ensure company header and sections have spacing for print */
        #invoice-print-area { font-family: serif; color: #111827; }
        .invoice-page .w-1\/3 img { max-width: 140px; height: auto; }
      `}</style>
    </div>
  );
};

export default Invoice;
