import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GameDig } from 'gamedig';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

const SERVERS = [
  {
    id: 'sv1',
    name: process.env.SERVER1_NAME || 'Servidor 1',
    host: process.env.SERVER1_HOST || '127.0.0.1',
    port: parseInt(process.env.SERVER1_PORT || '27015'),
    displayIp: process.env.SERVER1_DISPLAY_IP || null,
  },
  {
    id: 'sv2',
    name: process.env.SERVER2_NAME || 'Servidor 2',
    host: process.env.SERVER2_HOST || '127.0.0.1',
    port: parseInt(process.env.SERVER2_PORT || '27016'),
    displayIp: process.env.SERVER2_DISPLAY_IP || null,
  },
].filter((_, i) => process.env[`SERVER${i + 1}_HOST`] !== 'disabled');

let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 30_000;

async function queryOne(cfg) {
  try {
    const s = await GameDig.query({
      type: 'left4dead2',
      host: cfg.host,
      port: cfg.port,
      socketTimeout: 3000,
      attemptTimeout: 5000,
    });
    return {
      id: cfg.id,
      online: true,
      name: s.name,
      map: s.map,
      players: s.players.length,
      maxPlayers: s.maxplayers,
      ping: Math.round(s.ping),
      ip: cfg.displayIp || `${cfg.host}:${cfg.port}`,
      port: cfg.port,
      version: s.raw?.version ?? null,
    };
  } catch {
    return {
      id: cfg.id,
      online: false,
      name: cfg.name,
      map: null,
      players: 0,
      maxPlayers: 0,
      ping: null,
      ip: cfg.displayIp || `${cfg.host}:${cfg.port}`,
      port: cfg.port,
      version: null,
    };
  }
}

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xtreme API',
      version: '1.0.0',
      description: 'API para consultar estado de servidores L4D2',
    },
  },
  apis: ['./server.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: Estado de los servidores L4D2
 *     description: Retorna el estado actual de todos los servidores activos con caché de 30s
 *     responses:
 *       200:
 *         description: Lista de servidores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   online:
 *                     type: boolean
 *                   name:
 *                     type: string
 *                   map:
 *                     type: string
 *                   players:
 *                     type: integer
 *                   maxPlayers:
 *                     type: integer
 *                   ping:
 *                     type: integer
 *                   ip:
 *                     type: string
 *                   port:
 *                     type: integer
 *                   version:
 *                     type: string
 */
app.get('/servers', async (_req, res) => {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL) return res.json(_cache);

  _cache = await Promise.all(SERVERS.map(queryOne));
  _cacheAt = now;
  res.json(_cache);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica que la API esté corriendo
 *     responses:
 *       200:
 *         description: API online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 uptime:
 *                   type: number
 */
app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.listen(PORT, () => console.log(`[xtreme-api] running on :${PORT}`));

export default app; 