export interface ServerStatus {
  id: string;
  name: string;
  map: string | null;
  players: number;
  maxPlayers: number;
  online: boolean;
  ip: string;
  port: number;
  ping: number | null;
  version: string | null;
}
