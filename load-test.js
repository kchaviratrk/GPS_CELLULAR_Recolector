import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10, // Número de usuarios virtuales
  duration: "30s", // Duración de la prueba
};

export default function () {
  const res = http.get("http://localhost:5000/api/gps-status");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time is < 200ms": (r) => r.timings.duration < 200,
  });
  sleep(1);
}
