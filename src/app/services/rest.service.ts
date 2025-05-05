import { Injectable } from '@angular/core' ;
import { DomainConfiguration, Rest } from './Rest';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  domain_configuration:DomainConfiguration = {
    domain: 'https://uniformesprofesionales.integranet.xyz'
  };
  
  url_base = '/api'

  constructor(private http:HttpClient)
  {

  }
  public initRest<T, U>(path: string):Rest<T, U>
	{
		return new Rest<T, U>(this.domain_configuration,`${this.url_base}/${path}.php`, this.http);
	}

	public initRestSimple<T>(path: string):Rest<T, T>
	{
		return this.initRest<T, T>(path);
	}
}
