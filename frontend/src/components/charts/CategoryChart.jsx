import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatCurrency } from "../../utils/helpers";

const COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6","#F97316","#6366F1","#84CC16"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
        Value: <strong>{formatCurrency(payload[0].value)}</strong>
      </p>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
        Units: <strong>{payload[0].payload.totalUnits?.toLocaleString()}</strong>
      </p>
    </div>
  );
};

const CategoryChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
      <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--text-muted)" }} angle={-35} textAnchor="end" interval={0} />
      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="totalValue" radius={[4, 4, 0, 0]}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default CategoryChart;
