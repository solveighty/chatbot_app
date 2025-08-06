import { IConversationStateManager, IServiceService } from '../../../../../interfaces/services';

export class ServiceInquiryHandler {
  constructor(
    private readonly serviceService: IServiceService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async handleServiceInquiry(userId: string, userMessage: string, state: any): Promise<string | null> {
    const userMessageLower = userMessage.toLowerCase();

    // Si el usuario está en estado de solicitud de datos de servicio
    if (state && state.lastCategory === 'solicitar_datos_servicio') {
      return this.handleServiceDataCollection(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de nombre
    if (state && state.lastCategory === 'solicitar_nombre_servicio') {
      return this.handleNameInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de cédula
    if (state && state.lastCategory === 'solicitar_cedula_servicio') {
      return this.handleCedulaInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de teléfono
    if (state && state.lastCategory === 'solicitar_telefono_servicio') {
      return await this.handlePhoneInput(userId, userMessage, state);
    }

    // Procesar ID de servicio
    const serviceId = parseInt(userMessage);
    if (!isNaN(serviceId) && serviceId >= 1001 && serviceId <= 1005) {
      const service = this.serviceService.getServiceById(serviceId);
      if (service) {
        // Iniciar proceso de recolección de datos
        this.stateManager.updateState(userId, {
          lastCategory: 'solicitar_nombre_servicio',
          serviceId: serviceId,
          serviceName: service.nombre,
          timestamp: new Date()
        });

        return `🏛️ *${service.nombre}*\n\n` +
               `${service.descripcion}\n\n` +
               `📝 *Para procesar tu consulta, necesito algunos datos:*\n\n` +
               `👤 *Por favor, escribe tu nombre completo:*`;
      }
    }

    return null;
  }

  private handleNameInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Consulta cancelada*\n\n` +
             `No se registró ninguna consulta de servicio.\n\n` +
             `🏛️ Escribe *servicios* para ver los servicios disponibles.\n` +
             `📋 Escribe *productos* para ver el catálogo de productos.\n` +
             `📞 Escribe *quiero contactar con una hermana* para horarios de contacto.`;
    }

    if (userMessage.trim().length < 3) {
      return `❌ Por favor, escribe tu nombre completo (mínimo 3 caracteres).\n\n` +
             `❌ O escribe *cancelar* para salir sin registrar la consulta.`;
    }

    // Guardar nombre y solicitar cédula
    this.stateManager.updateState(userId, {
      ...state,
      lastCategory: 'solicitar_cedula_servicio',
      userName: userMessage.trim(),
      timestamp: new Date()
    });

    return `✅ *Nombre registrado:* ${userMessage.trim()}\n\n` +
           `🆔 *Ahora escribe tu número de cédula:*\n\n` +
           `❌ O escribe *cancelar* para salir sin registrar la consulta.`;
  }

  private handleCedulaInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Consulta cancelada*\n\n` +
             `No se registró ninguna consulta de servicio.\n\n` +
             `🏛️ Escribe *servicios* para ver los servicios disponibles.\n` +
             `📋 Escribe *productos* para ver el catálogo de productos.\n` +
             `📞 Escribe *quiero contactar con una hermana* para horarios de contacto.`;
    }

    const cedula = userMessage.trim();
    
    // Validar formato de cédula (10 dígitos)
    if (!/^\d{10}$/.test(cedula)) {
      return `❌ Por favor, escribe tu número de cédula (10 dígitos).\n\n` +
             `❌ O escribe *cancelar* para salir sin registrar la consulta.`;
    }

    // Guardar cédula y solicitar teléfono
    this.stateManager.updateState(userId, {
      ...state,
      lastCategory: 'solicitar_telefono_servicio',
      userCedula: cedula,
      timestamp: new Date()
    });

    return `✅ *Cédula registrada:* ${cedula}\n\n` +
           `📞 *Ahora escribe tu número de teléfono:*\n\n` +
           `❌ O escribe *cancelar* para salir sin registrar la consulta.`;
  }

  private async handlePhoneInput(userId: string, userMessage: string, state: any): Promise<string> {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Consulta cancelada*\n\n` +
             `No se registró ninguna consulta de servicio.\n\n` +
             `🏛️ Escribe *servicios* para ver los servicios disponibles.\n` +
             `📋 Escribe *productos* para ver el catálogo de productos.\n` +
             `📞 Escribe *quiero contactar con una hermana* para horarios de contacto.`;
    }

    const telefono = userMessage.trim();
    
    // Validar formato de teléfono (10 dígitos)
    if (!/^\d{10}$/.test(telefono)) {
      return `❌ Por favor, escribe tu número de teléfono (10 dígitos).\n\n` +
             `❌ O escribe *cancelar* para salir sin registrar la consulta.`;
    }

    // Procesar la consulta completa
    return await this.processCompleteServiceInquiry(userId, state, telefono);
  }

  private async processCompleteServiceInquiry(userId: string, state: any, telefono: string): Promise<string> {
    try {
      const userData = {
        nombre: state.userName,
        cedula: state.userCedula,
        telefono: telefono
      };

      const result = await this.serviceService.processServiceInquiry(userId, state.serviceId, userData);

      // Limpiar estado
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Error al procesar consulta de servicio:', error);
      return '❌ Error al procesar tu consulta. Por favor, intenta nuevamente.';
    }
  }

  private handleServiceDataCollection(userId: string, userMessage: string, state: any): string {
    // Este método se puede usar para manejo adicional de datos si es necesario
    return this.handleNameInput(userId, userMessage, state);
  }
} 