import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class PlayPauseService {

    public readonly state: Subject<number> = new Subject<number>();

    constructor() {}

    public play(): void{
        this.state.next(1);
    }



}