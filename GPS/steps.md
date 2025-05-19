# Pasos para Probar el Sistema de Monitoreo GPS en Otro Equipo

## Requisitos Previos

1. **Hardware:**

   - Una computadora con puerto serial (COM3) o un adaptador USB a serial.
   - Un dispositivo GPS conectado al puerto serial.

2. **Software:**

   - Python 3.x instalado en la computadora.
   - Node.js y npm instalados para el frontend.
   - Librerías de Python necesarias: `flask`, `pyserial` y `tkinter` (esta última suele venir con Python).

3. **Archivos del Proyecto:**
   - Copia toda la carpeta del proyecto (`Recolect-Com3`) al equipo destino.

---

## Paso 1: Configurar el Backend

1. Abre una terminal y navega a la carpeta del proyecto:

   ```bash
   cd /ruta/a/Recolect-Com3
   ```

2. Instala las librerías de Python necesarias:

   ```bash
   pip install flask pyserial
   ```

3. Conecta el dispositivo GPS al puerto serial (COM3).

4. Ejecuta la aplicación backend:
   ```bash
   python main.py
   ```
   - Esto iniciará la API de Flask y la interfaz gráfica para leer datos del puerto serial.
   - Asegúrate de que el GPS esté enviando datos al puerto serial.

---

## Paso 2: Configurar el Frontend

1. Abre una nueva terminal y navega a la carpeta `api`:

   ```bash
   cd /ruta/a/Recolect-Com3/api
   ```

2. Instala los paquetes npm necesarios:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo del frontend:

   ```bash
   npm run dev
   ```

4. Abre la URL que se muestra (por ejemplo, `http://localhost:5173`) en tu navegador para acceder al Dashboard de Monitoreo GPS.

---

## Paso 3: Probar el Sistema

1. **Verificar el Backend:**

   - Observa la terminal donde ejecutaste `main.py` para asegurarte de que se están leyendo y procesando los datos del GPS.
   - Usa una herramienta como `Postman` o `curl` para probar el endpoint de la API:
     ```bash
     curl http://localhost:3000/api/gps-status
     ```
     - Verifica que la respuesta sea un JSON con los datos del GPS.

2. **Verificar el Frontend:**

   - Abre el Dashboard en el navegador.
   - Confirma que los datos del GPS se muestran y se actualizan cada 5 segundos.

3. **Simular Escenarios:**
   - Desconecta el GPS y verifica cómo el sistema maneja los errores.
   - Simula diferentes estados del GPS (por ejemplo, bajo número de satélites) y revisa el Dashboard.

---

## Solución de Problemas

1. **Problemas en el Backend:**

   - Asegúrate de que el GPS esté correctamente conectado a COM3.
   - Revisa si hay errores en la terminal donde ejecutaste `main.py`.

2. **Problemas en el Frontend:**

   - Asegúrate de que el servidor frontend esté corriendo (`npm run dev`).
   - Revisa la consola del navegador por si hay errores.

3. **Conexión con la API:**
   - Verifica que el backend esté corriendo en `http://localhost:3000`.
   - Asegúrate de que no haya restricciones de red o firewall.

---

## Notas

- Si el equipo destino usa un puerto serial diferente (no COM3), edita el archivo `main.py` y cambia la línea:

  ```python
  self.serial_port = serial.Serial('COMX', baudrate=9600, timeout=1)
  ```

  Sustituye `COMX` por el nombre correcto del puerto.

- Para producción, considera empaquetar el frontend y servirlo con un servidor como `Flask` o `nginx`.
