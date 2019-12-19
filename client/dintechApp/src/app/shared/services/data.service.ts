import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};

@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}

  /** Create a new session, given a YouTube URL, and admin username. */
  public createSession(username: string, ytUrl: string): Observable<any> {
      return this.http.post(
        `${environment.restapi}/session`,
        {username, ytUrl},
        httpOptions
      );
  }
}
