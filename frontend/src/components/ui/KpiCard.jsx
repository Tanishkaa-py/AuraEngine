import { formatCurrency, formatNumber } from "../../utils/helpers";

const KpiCard = ({ title, value, subtitle, accent }) => {
  const accentMap = { blue: "#3B82F6", green: "#10B981", amber: "#F59E0B", red: "#EF4444" };

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderLeft: `4px solid ${accentMap[accent] || accentMap.blue}`,
      borderRadius: 10,
      padding: "20px 20px",
      minWidth: 0,
      overflow: "hidden",
    }}>
      <p style={{
        margin: 0, fontSize: 11, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
      }}>
        {title}
      </p>
      <p style={{
        margin: "10px 0 6px", fontSize: 22, fontWeight: 700,
        color: "var(--text-primary)", fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KpiCard;