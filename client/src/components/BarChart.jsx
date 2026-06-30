import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", emission: 18 },
  { day: "Tue", emission: 16 },
  { day: "Wed", emission: 20 },
  { day: "Thu", emission: 14 },
  { day: "Fri", emission: 17 },
  { day: "Sat", emission: 12 },
  { day: "Sun", emission: 15 },
];

export default function BarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#444" strokeDasharray="3 3" />

        <XAxis dataKey="day" stroke="#ffffff" tick={{ fill: "#ffffff" }} />

        <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} />

        <Tooltip
          contentStyle={{
            backgroundColor: "#1c1c1c",
            border: "1px solid #8ef58e",
            borderRadius: "10px",
          }}
        />

        <Line
          type="monotone"
          dataKey="emission"
          stroke="#8ef58e"
          strokeWidth={4}
          dot={{ fill: "#8ef58e", r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
