import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from 'src/environments/environment';

@Injectable()
export class WebsocketService {

    /**
     * Get WebSocketSubject for a given device-id and data point.
     * @param session session id.
     */
    public getSubject(session: string): WebSocketSubject<any> {
        var socket = webSocket(`${environment.ws}/ws/speed-assistant/` + session);
        socket.next('Bearer ' + localStorage.getItem("id_token"));
        return socket;
    }

}