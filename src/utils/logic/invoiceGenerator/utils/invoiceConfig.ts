// Configuración para el diseño del PDF de factura
export const INVOICE_CONFIG = {
  // Colores del tema
  colors: {
    primary: '#2C3E50',      // Azul oscuro para títulos
    secondary: '#34495E',    // Gris azulado para subtítulos
    accent: '#E74C3C',       // Rojo para elementos importantes
    success: '#27AE60',      // Verde para totales
    light: '#ECF0F1',       // Gris claro para fondos
    dark: '#2C3E50',        // Texto oscuro
    border: '#BDC3C7'       // Color para bordes
  },

  // Información de la empresa
  company: {
    name: 'Monasterio Trapense',
    fullName: 'Monasterio Trapense',
    address: 'Quito, Ecuador',
    phone: '(02) 234-5678',
    whatsapp: '+593 99 123 4567',
    email: 'info@monasteriotrapense.com',
    website: 'www.monasteriotrapense.com'
  },

  // Configuración del documento
  document: {
    title: 'FACTURA PARA RETIRO',
    subtitle: 'Monasterio Trapense',
    pageSize: 'A4',
    margin: 35,
    logoPath: 'assets/images/logo.png',
    logoFormats: ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.gif']
  },

  // Configuración de la tabla
  table: {
    headerHeight: 25,
    rowHeight: 25,
    alternateRowColor: true,
    showBorders: true,
    columnWidths: {
      item: 35,
      description: 220,
      quantity: 50,
      price: 70,
      total: 70
    }
  },

  // Configuración del código QR
  qrCode: {
    enabled: false, // Cambiar a 'true' para habilitar el código QR
    size: 60,
    includeInvoiceNumber: true,
    includeCompanyInfo: true
  },

  // Mensajes personalizables
  messages: {
    thankYou: '¡GRACIAS POR SU COMPRA!',
    processing: 'Su pedido ha sido registrado y será procesado a la brevedad.',
    contactInfo: 'Para consultas adicionales:',
    spiritualMessage: 'Que Dios bendiga su hogar.',
    footerNote: 'Este documento es una factura electrónica válida para retiro de productos.'
  },

  // Configuración de impuestos
  taxes: {
    ivaRate: 0, // 0% IVA
    ivaName: 'IVA (0%)',
    showTaxBreakdown: true
  },

  // Configuración de formato de números
  numberFormat: {
    decimalSeparator: ',',
    thousandsSeparator: '.',
    currencySymbol: '$',
    decimalPlaces: 2
  },

  // Configuración de fuentes
  fonts: {
    title: 'Helvetica-Bold',
    subtitle: 'Helvetica',
    body: 'Helvetica',
    emphasis: 'Helvetica-Bold'
  },

  // Configuración de tamaños de fuente (reducidos para diseño más compacto)
  fontSizes: {
    title: 22,
    subtitle: 16,
    sectionTitle: 14,
    body: 10,
    small: 9,
    tiny: 7
  }
};

// Función para obtener configuración personalizada
export function getInvoiceConfig(customConfig?: Partial<typeof INVOICE_CONFIG>) {
  if (!customConfig) {
    return INVOICE_CONFIG;
  }

  return {
    ...INVOICE_CONFIG,
    ...customConfig,
    colors: { ...INVOICE_CONFIG.colors, ...customConfig.colors },
    company: { ...INVOICE_CONFIG.company, ...customConfig.company },
    document: { ...INVOICE_CONFIG.document, ...customConfig.document },
    table: { ...INVOICE_CONFIG.table, ...customConfig.table },
    qrCode: { ...INVOICE_CONFIG.qrCode, ...customConfig.qrCode },
    messages: { ...INVOICE_CONFIG.messages, ...customConfig.messages },
    taxes: { ...INVOICE_CONFIG.taxes, ...customConfig.taxes },
    numberFormat: { ...INVOICE_CONFIG.numberFormat, ...customConfig.numberFormat },
    fonts: { ...INVOICE_CONFIG.fonts, ...customConfig.fonts },
    fontSizes: { ...INVOICE_CONFIG.fontSizes, ...customConfig.fontSizes }
  };
} 