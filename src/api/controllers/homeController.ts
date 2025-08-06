import { Request, Response } from 'express';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const serveHomePage = (req: Request, res: Response) => {
    const indexPath = path.join(process.cwd(), 'dist', 'reportes_ventas.html');
    res.sendFile(indexPath);
};

// Nuevo endpoint para obtener información del servidor
export const getServerInfo = (req: Request, res: Response) => {
    try {
        // Obtener IP local usando la misma lógica que MQTT
        const preferredInterfaces = ['Wi-Fi', 'Ethernet', 'LAN inalámbrica', 'WiFi', 'Wireless LAN adapter'];
        const interfaces = os.networkInterfaces();
        
        let ip: string | undefined;
        
        // Buscar en interfaces preferidas
        for (const name of preferredInterfaces) {
            const iface = interfaces[name];
            if (iface) {
                for (const alias of iface) {
                    if (alias.family === 'IPv4' && !alias.internal) {
                        ip = alias.address;
                        break;
                    }
                }
            }
            if (ip) break;
        }
        
        // Si no se encuentra en interfaces preferidas, buscar en todas las interfaces
        if (!ip) {
            for (const name of Object.keys(interfaces)) {
                const networkInterface = interfaces[name];
                if (networkInterface) {
                    for (const interface_ of networkInterface) {
                        if (interface_.family === 'IPv4' && !interface_.internal) {
                            ip = interface_.address;
                            break;
                        }
                    }
                }
                if (ip) break;
            }
        }
        
        const serverInfo = {
            ip: ip || '127.0.0.1',
            port: process.env.PORT || 3000,
            timestamp: new Date().toISOString(),
            hostname: os.hostname()
        };
        
        res.json({
            success: true,
            data: serverInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del servidor'
        });
    }
};

// Endpoint para listar facturas PDF en la carpeta temp
export const listFacturas = (req: Request, res: Response) => {
    try {
        const tempDir = path.join(process.cwd(), 'temp');
        const files = fs.readdirSync(tempDir);
        const pdfs = files.filter(f => f.endsWith('.pdf'));
        res.json({ success: true, files: pdfs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al listar facturas' });
    }
};