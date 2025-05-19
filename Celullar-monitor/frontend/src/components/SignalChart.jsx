import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import Typography from "@mui/material/Typography";

export default function SignalChart({ settings }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const fetchData = () => {
      fetch("http://localhost:8000/status")
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener datos");
          return res.json();
        })
        .then((status) => {
          if (!isMounted) return;
          setData((prev) => [
            ...prev.slice(-19),
            {
              time: new Date().toLocaleTimeString(),
              signal: status.signal_strength,
            },
          ]);
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) {
            enqueueSnackbar("Error al obtener el estado del módem", {
              variant: "error",
            });
            setLoading(false);
          }
        });
    };
    fetchData();
    const interval = setInterval(fetchData, (settings?.interval || 5) * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [settings?.interval, enqueueSnackbar]);

  // Color dinámico de la línea según el umbral
  const lineColor =
    settings?.threshold &&
    data.length > 0 &&
    data[data.length - 1]?.signal < settings.threshold
      ? "#ff9800"
      : "#1976d2";

  return (
    <section>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Signal Strength Over Time
      </Typography>
      {loading && <CircularProgress />}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" />
          <XAxis dataKey="time" />
          <YAxis domain={[-120, 0]} unit=" dBm" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="signal"
            stroke={lineColor}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
