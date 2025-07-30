# Sistema de Chatbot WhatsApp con Reportes de Ventas

## Descripción

Este proyecto implementa un chatbot de WhatsApp que gestiona pedidos y un sistema de reportes de ventas con descubrimiento automático de servidor usando MQTT con HiveMQ.

## Características Principales

- 🤖 **Chatbot de WhatsApp**: Gestiona pedidos automáticamente
- 📊 **Reportes de Ventas**: Interfaz web para visualizar ventas
- 🔍 **Descubrimiento Automático**: El servidor se descubre automáticamente via MQTT
- 🌐 **Acceso Multi-dispositivo**: Funciona desde cualquier dispositivo en la red
- 📱 **Responsive**: Interfaz adaptada para móviles y tablets

## Configuración MQTT

### Broker MQTT Online - HiveMQ

El sistema utiliza HiveMQ como broker MQTT online, lo que elimina la necesidad de configurar un broker local:

- **Puerto TLS**: `8883` (para el servidor)
- **Puerto WebSocket**: `8884` (para el cliente web)

### Ventajas de usar HiveMQ:

1. **Sin configuración local**: No necesitas instalar Mosquitto
2. **Acceso desde cualquier dispositivo**: Funciona desde teléfonos, tablets, etc.
3. **Conexión segura**: Usa TLS/WSS para comunicación encriptada
4. **Alta disponibilidad**: Servicio gestionado por HiveMQ
5. **Escalabilidad**: Soporta múltiples conexiones simultáneas

## Estructura del Proyecto

```
chatbot_app/
├── src/
│   ├── api/              # Servidor web y APIs
│   ├── config/           # Configuración
│   ├── core/             # Lógica principal
│   ├── handlers/         # Manejadores de comandos
│   ├── services/         # Servicios de negocio
│   ├── utils/            # Utilidades
│   └── app.ts           # Punto de entrada
├── assets/              # Imágenes y datos
├── dist/               # Archivos compilados
├── scripts/            # Scripts de build
└── reportes_ventas.html # Interfaz de reportes
```

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd chatbot_app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env`:
```env
PORT=3000
```

### 4. Compilar y ejecutar
```bash
npm run build
npm start
```

## Uso

### Chatbot de WhatsApp

1. Ejecuta el servidor: `npm start`
2. Escanea el código QR con WhatsApp
3. El chatbot estará listo para recibir pedidos

### Reportes de Ventas

1. Abre `reportes_ventas.html` en tu navegador
2. El sistema detectará automáticamente el servidor via MQTT
3. Selecciona fechas y genera reportes

### Acceso desde Otros Dispositivos

**Con MQTT (Automático)**:
- El sistema detecta automáticamente la IP del servidor
- Funciona desde cualquier dispositivo en la misma red

**Sin MQTT (Manual)**:
- Encuentra la IP de tu PC: `ipconfig` (Windows)
- Accede desde: `http://[IP-DE-TU-PC]:3000/reportes_ventas.html`

## Flujo de Descubrimiento Automático

1. **Servidor**: Detecta su IP real y la publica via MQTT a HiveMQ
2. **Cliente Web**: Se conecta a HiveMQ y recibe la IP del servidor
3. **Fallback**: Si MQTT falla, usa descubrimiento local
4. **Último recurso**: Si todo falla, usa localhost:3000

## API Endpoints

- `GET /api/reports/sales` - Obtener reporte de ventas
- `PUT /api/orders/:orderId/status` - Actualizar estado de pedido

## Tecnologías Utilizadas

- **Backend**: Node.js, TypeScript, Express
- **MQTT**: HiveMQ (broker online)
- **Frontend**: HTML, CSS, JavaScript
- **WhatsApp**: whatsapp-web.js
- **Logging**: Winston

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.