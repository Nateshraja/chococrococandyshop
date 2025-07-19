import { useEffect, useState } from "react";

const PrintPage = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("printData");
    if (stored) {
      setData(JSON.parse(stored));
      setTimeout(() => window.print(), 1000); // Auto print
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "800px", margin: "0 auto", border: "1px solid #ccc" }}>
      {/* Header with logo and company */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "1rem", marginBottom: "1rem" }}>
        <div>
          <img src="/logo.png" alt="Logo" style={{ height: "60px" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0 }}>ChocoWrap Creations</h2>
          <p style={{ margin: 0 }}>123 Sweet Lane, Coimbatore, TN</p>
          <p style={{ margin: 0 }}>Email: hello@chocowrap.in | Phone: +91-98765-43210</p>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>INVOICE</h3>

      {/* Order & Customer Info */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <p><strong>Order ID:</strong> {data.orderId}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
        <div>
          <p><strong>Customer Name:</strong> {data.name}</p>
          <p><strong>Phone:</strong> {data.phone}</p>
        </div>
      </div>

      {/* Order Details Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={cellStyle}>Chocolate Type</th>
            <th style={cellStyle}>Quantity</th>
            <th style={cellStyle}>Purpose</th>
            <th style={cellStyle}>Remarks</th>
            <th style={cellStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>{data.chocolateType}</td>
            <td style={cellStyle}>{data.quantity}</td>
            <td style={cellStyle}>{data.purpose}</td>
            <td style={cellStyle}>{data.remarks}</td>
            <td style={cellStyle}>₹{data.total}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
        <p>Thank you for your order!</p>
        <p>ChocoWrap Creations © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

export default PrintPage;
