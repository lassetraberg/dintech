import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

@Injectable()
export class WebsocketService {

    /**
     * Get WebSocketSubject for video session.
     */
    public getSubject(session: string, username: string): WebSocketSubject<any> {
        var socket = webSocket(`${environment.ws}/session/${session}/?username=${username}`);
        return socket;
    }

}