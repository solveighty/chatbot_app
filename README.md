# 🤖 Chatbot WhatsApp - Monasterio Trapense

## 📋 Descripción

Sistema completo de gestión de pedidos para el Monasterio Trapense que incluye un chatbot de WhatsApp inteligente, generación automática de facturas PDF, y un sistema de reportes de ventas en tiempo real. El proyecto está diseñado para automatizar completamente el proceso de ventas y gestión de pedidos.

## ✨ Características Principales

### 🤖 **Chatbot de WhatsApp Inteligente**
- **Gestión automática de pedidos** con reconocimiento de comandos
- **Catálogo de productos** organizado por categorías
- **Carrito de compras** con gestión de cantidades
- **Validación de datos del cliente** (nombre, dirección, teléfono)
- **Generación automática de facturas PDF** profesionales
- **Procesamiento de imágenes** de productos

### 📊 **Sistema de Reportes Avanzado**
- **Reportes de ventas** en tiempo real
- **Filtros por fecha, producto y estado**
- **Gráficos interactivos** de rendimiento
- **Descubrimiento automático de servidor** via MQTT
- **Interfaz responsive** para móviles y tablets

### 🎨 **Generador de Facturas PDF Profesional**
- **Diseño moderno y elegante** con paleta de colores profesional
- **Configuración centralizada** fácil de personalizar
- **Soporte para logos** automático
- **Código QR** para seguimiento (opcional)
- **Formato de moneda localizado**
- **Múltiples idiomas** (español)

### 🔧 **Arquitectura Robusta**
- **TypeScript** para código tipado y mantenible
- **Arquitectura modular** con separación de responsabilidades
- **Sistema de logging** completo con Winston
- **Manejo de errores** robusto
- **Configuración flexible** por archivos

## 🏗️ Estructura del Proyecto

```
chatbot_app/
├── 📁 src/
│   ├── 📁 api/                    # Servidor web y APIs REST
│   │   ├── 📁 controllers/        # Controladores de endpoints
│   │   ├── 📁 middlewares/        # Middlewares de Express
│   │   ├── 📁 routes/             # Definición de rutas
│   │   └── server.ts              # Servidor principal
│   ├── 📁 config/                 # Configuración del proyecto
│   │   ├── di.ts                  # Inyección de dependencias
│   │   └── environment.ts         # Variables de entorno
│   ├── 📁 core/                   # Lógica principal del chatbot
│   │   ├── client.ts              # Cliente de WhatsApp
│   │   └── 📁 handler/            # Manejadores de eventos
│   ├── 📁 handlers/               # Manejadores de comandos y mensajes
│   │   ├── 📁 commandHandler/     # Lógica de comandos
│   │   └── 📁 messageHandler/     # Procesamiento de mensajes
│   ├── 📁 services/               # Servicios de negocio
│   │   ├── botService.ts          # Servicio principal del bot
│   │   ├── cartService.ts         # Gestión del carrito
│   │   ├── orderService.ts        # Gestión de pedidos
│   │   ├── productService.ts      # Gestión de productos
│   │   └── responseService.ts     # Respuestas del bot
│   ├── 📁 utils/                  # Utilidades y herramientas
│   │   ├── 📁 logic/
│   │   │   └── 📁 invoiceGenerator/ # Generador de facturas PDF
│   │   ├── logger.ts              # Sistema de logging
│   │   ├── mqttService.ts         # Servicio MQTT
│   │   └── validators.ts          # Validadores de datos
│   └── app.ts                     # Punto de entrada principal
├── 📁 assets/                     # Recursos estáticos
│   ├── 📁 images/                 # Imágenes de productos
│   ├── products.json              # Catálogo de productos
│   └── responses.json             # Respuestas del bot
├── 📁 logs/                       # Archivos de log
├── 📁 temp/                       # Archivos temporales (facturas)
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración TypeScript
└── reportes_ventas.html           # Interfaz de reportes
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **WhatsApp** en tu teléfono
- **Conexión a internet** (para WhatsApp Web y MQTT)

### 🔧 Instalación Paso a Paso

#### 1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd chatbot_app
```

#### 2. **Instalar dependencias**
```bash
npm install
```

#### 3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de WhatsApp (opcional)
WHATSAPP_SESSION_PATH=./whatsapp-session

# Configuración de logging
LOG_LEVEL=info
```

#### 4. **Compilar el proyecto**
```bash
npm run build
```

#### 5. **Ejecutar el servidor**
```bash
npm start
```

### 📱 Configuración del Chatbot

#### **Primera vez:**
1. Ejecuta `npm start`
2. Se abrirá una ventana del navegador con un código QR
3. Escanea el código QR con tu WhatsApp
4. El chatbot estará listo para recibir pedidos

#### **Sesiones posteriores:**
- El sistema guardará la sesión automáticamente
- No necesitarás escanear el código QR nuevamente

## 🎯 Cómo Usar el Sistema

### 🤖 **Comandos del Chatbot**

#### **Comandos Básicos:**
- `hola` - Saludo inicial y menú principal
- `ayuda` - Muestra comandos disponibles
- `productos` - Lista todas las categorías
- `carrito` - Muestra el carrito actual
- `limpiar` - Vacía el carrito

#### **Navegación por Categorías:**
- `1` - Productos de panadería
- `2` - Productos de miel
- `3` - Productos artesanales
- `4` - Productos religiosos
- `5` - Productos ecológicos

#### **Gestión de Productos:**
- `[número]` - Selecciona un producto
- `cantidad [número]` - Especifica cantidad
- `agregar` - Agrega al carrito
- `quitar [número]` - Quita del carrito

#### **Proceso de Compra:**
- `comprar` - Inicia el proceso de checkout
- `[nombre]` - Proporciona tu nombre
- `[dirección]` - Proporciona tu dirección
- `[teléfono]` - Proporciona tu teléfono
- `confirmar` - Confirma la compra

### 📊 **Sistema de Reportes**

#### **Acceso Local:**
1. Abre `reportes_ventas.html` en tu navegador
2. El sistema detectará automáticamente el servidor

#### **Acceso desde Otros Dispositivos:**
1. Encuentra la IP de tu PC: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. Accede desde: `http://[IP-DE-TU-PC]:3000/reportes_ventas.html`

#### **Funcionalidades:**
- **Filtros por fecha** - Selecciona rangos específicos
- **Filtros por producto** - Analiza productos específicos
- **Filtros por estado** - Ver pedidos pendientes, completados, etc.
- **Exportación** - Descarga reportes en diferentes formatos

### 🎨 **Personalización de Facturas**

#### **Configurar Colores:**
Edita `src/utils/logic/invoiceGenerator/utils/invoiceConfig.ts`:
```typescript
colors: {
  primary: '#tu-color-principal',
  accent: '#tu-color-de-acento',
  // ... otros colores
}
```

#### **Cambiar Información de la Empresa:**
```typescript
company: {
  name: 'Tu Empresa',
  address: 'Tu Dirección',
  phone: 'Tu Teléfono',
  // ... otros datos
}
```

#### **Agregar Logo:**
1. Coloca tu logo en `assets/images/`
2. Nómbralo como: `logo.png`, `logo.jpg`, `logo.jpeg` o `logo.gif`
3. El sistema lo detectará automáticamente

#### **Deshabilitar Código QR:**
```typescript
qrCode: {
  enabled: false, // Cambiar a 'true' para habilitar
}
```

## 🔧 Configuración Avanzada

### **MQTT (Descubrimiento Automático)**

El sistema usa HiveMQ para descubrimiento automático:
- **Puerto TLS**: `8883` (servidor)
- **Puerto WebSocket**: `8884` (cliente web)

### **Logging**

Configuración de logs en `src/utils/logger.ts`:
- **Nivel**: `info`, `warn`, `error`, `debug`
- **Archivos**: Se guardan en `logs/`
- **Rotación**: Automática por fecha

### **Productos**

Edita `assets/products.json` para modificar el catálogo:
```json
{
  "categoria": "Panadería",
  "productos": [
    {
      "id": 1,
      "nombre": "Pan Integral",
      "precio": 2.50,
      "descripcion": "Pan integral fresco",
      "imagen": "pan-integral.jpg"
    }
  ]
}
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecuta en modo desarrollo con hot reload
npm run build        # Compila el proyecto
npm start            # Ejecuta en producción

# Utilidades
npm run clean        # Limpia archivos temporales
npm run logs         # Muestra logs en tiempo real
npm run test         # Ejecuta tests (si están configurados)
```

## 🔍 Solución de Problemas

### **Problemas Comunes:**

#### **WhatsApp no conecta:**
- Verifica tu conexión a internet
- Asegúrate de que WhatsApp esté abierto en tu teléfono
- Revisa los logs en `logs/`

#### **Facturas no se generan:**
- Verifica que la carpeta `temp/` tenga permisos de escritura
- Revisa que las dependencias estén instaladas: `npm install`

#### **Reportes no cargan:**
- Verifica que el servidor esté ejecutándose: `npm start`
- Comprueba la IP del servidor en los logs
- Asegúrate de estar en la misma red WiFi

#### **Errores de compilación:**
- Limpia la caché: `npm run clean`
- Reinstala dependencias: `rm -rf node_modules && npm install`

### **Logs y Debugging:**

Los logs se guardan en `logs/` con el formato:
- `app-YYYY-MM-DD.log` - Logs de la aplicación
- `error-YYYY-MM-DD.log` - Logs de errores

## 🚀 Despliegue en Producción

### **Recomendaciones:**
- Usa **PM2** para gestión de procesos
- Configura **nginx** como proxy reverso
- Usa **SSL/TLS** para conexiones seguras
- Configura **backups** automáticos de la base de datos

### **Variables de Entorno de Producción:**
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
```

## 🤝 Contribuir

1. **Fork** el proyecto
2. Crea una **rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -am 'Agrega nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request**

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: Abre un issue en GitHub
- **Documentación**: Revisa los comentarios en el código
- **Logs**: Consulta los archivos en `logs/`

---

**Desarrollado con ❤️ para el Monasterio Trapense**