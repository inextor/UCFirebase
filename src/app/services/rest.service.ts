import { Injectable } from '@angular/core';
import { DomainConfiguration, Rest, RestResponse, CsvArray, CsvNumberArray } from './Rest';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorMessage, Utils } from '../classes/Utils';

@Injectable({
    providedIn: 'root'
})
export class RestService
{
	public error_behavior_subject = new BehaviorSubject<ErrorMessage>(new ErrorMessage('',''));

	showError(error: any, auto_hide:boolean = true)
	{
		console.log('Error to display is', error);
		if( error instanceof ErrorMessage )
		{
			this.showErrorMessage(error);
			return;
		}
		let str_error = Utils.getErrorString(error);
		this.showErrorMessage(new ErrorMessage(str_error, 'alert-danger', auto_hide));
	}

	showErrorMessage(error: ErrorMessage)
	{
		this.error_behavior_subject.next(error);
	}

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
