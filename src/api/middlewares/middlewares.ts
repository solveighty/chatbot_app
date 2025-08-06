import cors from 'cors';
import express from 'express';
import path from 'path';

export function setupMiddlewares(app: express.Express) {
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.use('/temp', express.static(path.join(process.cwd(), 'temp')));
}