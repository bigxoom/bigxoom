import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

// Real-time Kitchen Display System — no page refresh needed on the LAN.
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/kitchen' })
export class KitchenGateway {
  @WebSocketServer()
  server: Server;

  broadcastNewTicket(payload: any) {
    this.server.emit('ticket:new', payload);
  }

  broadcastTicketUpdate(payload: any) {
    this.server.emit('ticket:update', payload);
  }
}
