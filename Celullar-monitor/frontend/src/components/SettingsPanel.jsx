import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function SettingsPanel({ settings, onChange }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val =
      name === "interval" || name === "threshold" ? Number(value) : value;
    setLocalSettings((prev) => ({ ...prev, [name]: val }));
    onChange({ ...localSettings, [name]: val });
  };

  return (
    <Box component="section">
      <Typography variant="h6" sx={{ mb: 1 }}>
        Configuración
      </Typography>
      <TextField
        label="Umbral de señal (dBm)"
        type="number"
        name="threshold"
        value={localSettings.threshold}
        onChange={handleChange}
        sx={{ mb: 2, mr: 2, width: 200 }}
        inputProps={{ min: -120, max: 0 }}
      />
      <TextField
        label="Intervalo de chequeo (segundos)"
        type="number"
        name="interval"
        value={localSettings.interval}
        onChange={handleChange}
        sx={{ mb: 2, width: 250 }}
        inputProps={{ min: 1, max: 60 }}
      />
    </Box>
  );
}
