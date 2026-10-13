import * as signalR from '@microsoft/signalr';
import { refreshAccessToken } from './client';

// Один хаб-коннект на вкладку; токен берётся из localStorage,
// при его отсутствии — тихо обновляем сессию через refresh-cookie.
let connection: signalR.HubConnection | null = null;

async function getToken(): Promise<string> {
  const token = localStorage.getItem('token');
  if (token) return token;
  const refreshed = await refreshAccessToken();
  return refreshed ? localStorage.getItem('token') || '' : '';
}

export function getSupportHub(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/support', {
      accessTokenFactory: getToken,
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startSupportHub(): Promise<boolean> {
  const conn = getSupportHub();
  if (conn.state === signalR.HubConnectionState.Connected) return true;
  try {
    await conn.start();
    return true;
  } catch {
    return false;
  }
}

export function stopSupportHub(): void {
  if (connection) {
    connection.stop().catch(() => {});
    connection = null;
  }
}
