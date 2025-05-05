import { Injectable } from '@angular/core';
import { DomainConfiguration, Rest, RestResponse, CsvArray, CsvNumberArray } from './Rest';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RestService {

    domain_configuration: DomainConfiguration = {
        domain: 'https://uniformesprofesionales.integranet.xyz'
    };

    url_base = '/api'

    constructor(private http: HttpClient) {

    }
    public initRest<T, U>(path: string): Rest<T, U> {
        return new Rest<T, U>(this.domain_configuration, `${this.url_base}/${path}.php`, this.http);
    }

    public initRestSimple<T>(path: string): Rest<any,any> {
        return this.initRest<any, any>(path);
    }

    public getUsers(): Observable<RestResponse<any>> {
        return this.initRestSimple<any>('user').getAll();
    }
}
