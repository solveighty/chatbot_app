import * as fs from 'fs-extra';
import * as path from 'path';
import logger from '../utils/logger';
import { IServiceService } from '../interfaces/services';
import { normalizeString } from '../utils/stringUtils';

// Interfaces locales
interface ServiceProduct {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  contacto: {
    telefono: string;
    mensaje: string;
  };
}

interface ServiceCategory {
  categoria: string;
  tipo: string;
  descripcion: string;
  productos: ServiceProduct[];
}

interface ContactHours {
  horarios: {
    dia: string;
    hora_inicio: string;
    hora_fin: string;
    descripcion: string;
  }[];
  contacto: {
    telefono: string;
    whatsapp: string;
    mensaje_principal: string;
    mensaje_emergencia?: string;
    notas?: string;
  };
  comandos_contacto: string[];
}

interface ServiceInquiry {
  id: number;
  date: string;
  clientName: string;
  clientCedula: string;
  clientPhone: string;
  serviceName: string;
  serviceCategory: string;
  status: string;
}

export class ServiceService implements IServiceService {
  private services: ServiceCategory[] = [];
  private contactHours: ContactHours | null = null;
  private serviceInquiries: ServiceInquiry[] = [];

  private servicesFilePath: string;
  private contactHoursFilePath: string;
  private serviceInquiriesFilePath = path.join(__dirname, '../../../data/service_inquiries.json');

  constructor() {
    // Detectar si estamos en producción (ejecutando desde dist)
    const isProd = __dirname.includes('dist');
    this.servicesFilePath = isProd
      ? path.join(process.cwd(), 'dist/data/services.json')
      : path.join(__dirname, '../../../assets/services.json');
    this.contactHoursFilePath = isProd
      ? path.join(process.cwd(), 'dist/data/contact-hours.json')
      : path.join(__dirname, '../../../assets/contact-hours.json');
    this.loadServices();
    this.loadContactHours();
    this.loadServiceInquiries();
  }

  private loadServices(): void {
    try {
      logger.info(`Intentando cargar servicios desde: ${this.servicesFilePath}`);
      const data = fs.readFileSync(this.servicesFilePath, 'utf8');
      this.services = JSON.parse(data);
      logger.info(`✅ Servicios cargados exitosamente. Total de categorías: ${this.services.length}`);
      
      // Log detallado de servicios cargados
      let totalServicios = 0;
      this.services.forEach((categoria, index) => {
        totalServicios += categoria.productos.length;
        logger.info(`  Categoría ${index + 1}: ${categoria.categoria} - ${categoria.productos.length} servicios`);
      });
      logger.info(`📦 Total de servicios cargados: ${totalServicios}`);
      
    } catch (error) {
      logger.error('❌ Error al cargar servicios:', error);
      logger.error(`Ruta del archivo: ${this.servicesFilePath}`);
      this.services = [];
    }
  }

  private loadContactHours(): void {
    try {
      logger.info(`Intentando cargar horarios de contacto desde: ${this.contactHoursFilePath}`);
      const data = fs.readFileSync(this.contactHoursFilePath, 'utf8');
      this.contactHours = JSON.parse(data);
      logger.info('✅ Horarios de contacto cargados exitosamente.');
    } catch (error) {
      logger.error('❌ Error al cargar horarios de contacto:', error);
      logger.error(`Ruta del archivo: ${this.contactHoursFilePath}`);
      this.contactHours = null;
    }
  }

  private loadServiceInquiries(): void {
    try {
      if (fs.existsSync(this.serviceInquiriesFilePath)) {
        const data = fs.readFileSync(this.serviceInquiriesFilePath, 'utf8');
        this.serviceInquiries = JSON.parse(data);
        logger.info('Consultas de servicios cargadas exitosamente.');
      } else {
        this.serviceInquiries = [];
        logger.info('No se encontró el archivo de consultas de servicios, inicializando vacío.');
      }
    } catch (error) {
      logger.error('Error al cargar consultas de servicios:', error);
      this.serviceInquiries = [];
    }
  }

  public async saveServiceInquiries(): Promise<void> {
    try {
      await fs.writeJson(this.serviceInquiriesFilePath, this.serviceInquiries, { spaces: 2 });
      logger.info('Consultas de servicios guardadas exitosamente.');
    } catch (error) {
      logger.error('Error al guardar consultas de servicios:', error);
    }
  }

  public getServices(): ServiceCategory[] {
    return this.services;
  }

  public getServiceCategories(): string[] {
    return this.services.map(cat => cat.categoria);
  }

  public getServiceByCategory(categoria: string): ServiceCategory | undefined {
    return this.services.find(cat => normalizeString(cat.categoria) === normalizeString(categoria));
  }

  public getServiceProduct(categoria: string, nombre: string): ServiceProduct | undefined {
    const service = this.getServiceByCategory(categoria);
    if (!service) return undefined;

    return service.productos.find(producto => 
      normalizeString(producto.nombre).includes(normalizeString(nombre))
    );
  }

  public getServiceById(id: number): ServiceProduct | undefined {
    for (const category of this.services) {
      for (const service of category.productos) {
        if (service.id === id) {
          return service;
        }
      }
    }
    return undefined;
  }

  public getServiceByName(name: string): ServiceProduct | undefined {
    const normalizedName = normalizeString(name);
    for (const category of this.services) {
      for (const service of category.productos) {
        if (normalizeString(service.nombre) === normalizedName) {
          return service;
        }
      }
    }
    return undefined;
  }

  public generateServicesMenu(): string {
    let message = "🏛 *SERVICIOS DEL MONASTERIO*\n\n";
    message += "Selecciona un servicio para más información:\n\n";

    this.services.forEach((category, index) => {
      message += `${index + 1}. ${category.categoria}\n`;
      message += `   ${category.descripcion}\n\n`;

      category.productos.forEach((service: ServiceProduct) => {
        message += `   ${service.id}. ${service.nombre}\n`;
        message += `      ${service.descripcion}\n`;
        message += `      📞 Contacto: ${service.contacto.telefono}\n\n`;
      });
    });

    if (this.contactHours && this.contactHours.contacto.telefono) {
      message += `📞 Para contactar con una hermana, escribe: *${this.contactHours.comandos_contacto[0]}*`;
    }

    return message;
  }

  public generateServiceDetails(categoria: string): string {
    const service = this.getServiceByCategory(categoria);
    if (!service) {
      return '❌ Servicio no encontrado.';
    }

    let details = `🏛️ *${service.categoria.toUpperCase()}*\n\n`;
    details += `${service.descripcion}\n\n`;
    details += '*Servicios disponibles:*\n\n';

    service.productos.forEach((producto: ServiceProduct) => {
      details += `${producto.id}. *${producto.nombre}*\n`;
      details += `   ${producto.descripcion}\n`;
      details += `   📞 Contacto: ${producto.contacto.telefono}\n\n`;
    });

    details += '📞 *Para reservar cualquier servicio, contacta directamente al WhatsApp: 0999946157*';
    return details;
  }

  public getContactHours(): string {
    if (!this.contactHours) {
      return 'Lo siento, no tengo información sobre los horarios de contacto en este momento.';
    }

    let message = "📞 *Horarios de Contacto:*\n\n";
    this.contactHours.horarios.forEach((horario: any) => {
      message += `*${horario.dia}:* ${horario.hora_inicio} - ${horario.hora_fin} (${horario.descripcion})\n`;
    });

    message += `\n*Contacto Principal:*\n`;
    message += `WhatsApp: ${this.contactHours.contacto.whatsapp}\n`;
    message += `Teléfono: ${this.contactHours.contacto.telefono}\n`;
    message += `\n${this.contactHours.contacto.mensaje_principal}\n`;

    if (this.contactHours.contacto.mensaje_emergencia) {
      message += `\n*Mensaje de Emergencia:*\n`;
      message += `${this.contactHours.contacto.mensaje_emergencia}\n`;
    }

    if (this.contactHours.contacto.notas) {
      message += `\n*Notas:*\n`;
      message += `${this.contactHours.contacto.notas}\n`;
    }

    return message;
  }

  public isContactCommand(message: string): boolean {
    if (!this.contactHours) return false;
    
    const messageLower = normalizeString(message);
    return this.contactHours.comandos_contacto.some(comando => 
      messageLower.includes(normalizeString(comando))
    );
  }

  public getServiceContactInfo(categoria: string, nombre: string): string {
    const producto = this.getServiceProduct(categoria, nombre);
    if (!producto) {
      return '❌ Servicio no encontrado.';
    }

    return `📞 *INFORMACIÓN DE CONTACTO*\n\n` +
           `🏛️ *${producto.nombre}*\n` +
           `${producto.descripcion}\n\n` +
           `📱 *WhatsApp:* ${producto.contacto.telefono}\n` +
           `📞 *Teléfono:* ${producto.contacto.telefono}\n\n` +
           `${producto.contacto.mensaje}`;
  }

  public async processServiceInquiry(userId: string, serviceId: number, userData: { nombre: string; cedula: string; telefono: string }): Promise<string> {
    const service = this.getServiceById(serviceId);
    if (!service) {
      return '❌ Servicio no encontrado.';
    }

    // Crear nueva consulta
    const inquiry: ServiceInquiry = {
      id: Date.now(),
      date: new Date().toISOString(),
      clientName: userData.nombre,
      clientCedula: userData.cedula,
      clientPhone: userData.telefono,
      serviceName: service.nombre,
      serviceCategory: '', // We'll find the category from the services array
      status: 'Pendiente'
    };

    // Find the category for this service
    for (const category of this.services) {
      if (category.productos.some(p => p.id === serviceId)) {
        inquiry.serviceCategory = category.categoria;
        break;
      }
    }

    // Agregar a la lista y guardar
    this.serviceInquiries.push(inquiry);
    await this.saveServiceInquiries();

    return `✅ *Consulta registrada exitosamente*\n\n` +
           `🏛️ *Servicio:* ${service.nombre}\n` +
           `👤 *Nombre:* ${userData.nombre}\n` +
           `🆔 *Cédula:* ${userData.cedula}\n` +
           `📞 *Teléfono:* ${userData.telefono}\n\n` +
           `📞 *Contacta con la hermana encargada del hospedaje en este horario:*\n` +
           `📅 *Días:* Lunes a viernes\n` +
           `⏰ *Horas de atención:* 08:00 - 17:00\n\n` +
           `📱 *WhatsApp:* 0999946157\n` +
           `📞 *Teléfono:* 0999946157`;
  }

  public getServiceInquiries(): ServiceInquiry[] {
    return this.serviceInquiries;
  }
}