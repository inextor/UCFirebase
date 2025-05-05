import { HttpErrorResponse } from '@angular/common/http';

export interface Coordinates
{
	lat:number;
	lng:number;
}


export class ErrorMessage{

	count:number;
	message:string;
	type:string;
	msg_button:string;
	color:string;
	auto_hide:boolean = true;
	constructor(message:string,type:string, auto_hide:boolean=true)
	{
		this.message	= message;
		this.type	= type;
		this.count = 0;
		this.auto_hide = auto_hide;

		if( type == 'alert-success')
		{
			this.msg_button = '✔️';
			this.color = 'green';
		}
		else
		{
			this.msg_button = '✖';
			this.color = 'red';
		}
	}
}

interface StopPropagationFunction{
	(): boolean;
}


export class Utils
{
	static getLocalDateFromMysqlString(str:string):Date | null
	{
		if (str == null)
			return null;

		return this.getDateFromLocalMysqlString(str)
	}

	static getEndOfMonth(date:Date):Date
	{
		let month = new Date();
		month.setTime(date.getTime());
		month.setHours(23,59,59,0);
		month.setMonth(month.getMonth()+1);
		month.setDate(0);
		return month;
	}

	static zero(n: number): string
	{
		return n < 10 ? '0' + n : '' + n;
	}

	static getDateFromUTCMysqlString(str:string | Date):Date
	{
		if( str instanceof Date )
			return str;

		let components = str.split(/-|:|\s|T/g);

		let f:number[] = [];

		f.push( parseInt(components[0]) );
		f.push( parseInt(components[1])-1 );
		f.push( parseInt(components[2]) );
		f.push( components.length<4?0:parseInt(components[3]))
		f.push( components.length<5?0:parseInt(components[4]))
		f.push( components.length<6?0:parseInt(components[5]))

		let utcTime = Date.UTC( f[0], f[1], f[2], f[3], f[4], f[5] );

		let d = new Date();
		d.setTime(utcTime);

		return d;

	}
	static getDateFromMysqlString(str:string):Date
	{
		return Utils.getDateFromUTCMysqlString(str);
	}

	static getDateFromLocalMysqlString(str:string):Date
	{
		let components = str.split(/-|:|\s|T/g);

		let f:number[] = [];

		f.push( parseInt(components[0]) );
		f.push( parseInt(components[1])-1 );
		f.push( parseInt(components[2]) );
		f.push( components.length<4?0:parseInt(components[3]))
		f.push( components.length<5?0:parseInt(components[4]))
		f.push( components.length<6?0:parseInt(components[5]))

		return new Date( f[0], f[1], f[2], f[3], f[4], f[5], 0);
	}

	static getLocalMysqlStringFromDate(date:Date):string
	{
		let d= new Date();
		d.setTime(date.getTime());

		let event_string = d.getFullYear()
		+ '-' + this.zero(d.getMonth() + 1)
		+ '-' + this.zero(d.getDate())
		+ ' ' + this.zero(d.getHours())
		+ ':' + this.zero(d.getMinutes())
		+ ':' + this.zero(d.getSeconds());

		return event_string;
	}

	static getMysqlStringFromLocalDate(d: Date): string
	{
		let event_string = d.getFullYear()
			+ '-' + this.zero(d.getMonth() + 1)
			+ '-' + this.zero(d.getDate())
			+ ' ' + this.zero(d.getHours())
			+ ':' + this.zero(d.getMinutes())
			+ ':' + this.zero(d.getSeconds());

		return event_string;
	}

	static getUTCMysqlStringFromDate(d:Date):string
	{
		let event_string = d.getUTCFullYear()
			+ '-' + this.zero(d.getUTCMonth() + 1)
			+ '-' + this.zero(d.getUTCDate())
			+ ' ' + this.zero(d.getUTCHours())
			+ ':' + this.zero(d.getUTCMinutes())
			+ ':' + this.zero(d.getUTCSeconds());

		return event_string;

	}
	static getMysqlStringFromDate(d: Date): string
	{
		let event_string = d.getUTCFullYear()
			+ '-' + this.zero(d.getUTCMonth() + 1)
			+ '-' + this.zero(d.getUTCDate())
			+ ' ' + this.zero(d.getUTCHours())
			+ ':' + this.zero(d.getUTCMinutes())
			+ ':' + this.zero(d.getUTCSeconds());

		return event_string;
	}

	static getErrorString( error:any ):string
	{
		if (error == null || error === undefined)
			return 'Error desconocido';

		if (typeof error === "string")
			return error;

		if( 'error' in error )
		{
			if( typeof(error.error) == 'string' )
			{
				return error.error;
			}

			if( error.error && 'error' in error.error && error.error.error )
			{
				return error.error.error;
			}
		}

		if( error instanceof HttpErrorResponse )
		{
			return error.statusText;
		}

		return 'Error desconocido';
	}

	static transformJson(response:string):any
	{
		return JSON.parse( response, (key,value)=>
		{
			if (typeof value === "string")
			{
				if( /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test( value ) )
				{
					let components = value.split(/T|-|:|\s/g);
					let utcTime = Date.UTC
					(
						parseInt( components[0] ),
						parseInt( components[1] )-1,
						parseInt( components[2] ),
						parseInt( components[3] ),
						parseInt( components[4] )
					);
					let localTime = new Date();
					localTime.setTime( utcTime );
					return localTime;
				}
			}
			return value;
		});
	}

	static createDictionary(obj_list:any[],index:string|number):Record<string,any> | Record<number,any>
	{
		let dictionary:Record<string|number,any> = {};
		obj_list.forEach(i=>
		{
			if( index in i )
			{
				dictionary[ i[index] ] = i;
			}
		});

		return dictionary;
	}

	static truncate(value:number, decimals:number = 2):number
	{
		let factor = [1,10,100,1000,10000,100000,1000000,10000000,100000000,1000000000];
		return Math.round(value * factor[decimals])/factor[decimals];
	}

	static transformDatesToString(body:any):any
	{
		if (body === null || body === undefined)
		{
			return body;
		}

		if (typeof body !== 'object') {
			return body;
		}

		for (const key of Object.keys(body))
		{
			const value = body[key];

			if( value instanceof Date )
			{
				body[key] = Utils.getUTCMysqlStringFromDate( value );
			}
			else if (typeof value === 'object')
			{
				Utils.transformDatesToString(value);
			}
		}
		return body;
	}


	static getRelativeDateString(value:any, today:Date = new Date()):string
	{
		let date = Utils.getDateFromValue( value );

		if( date == null )
			return '';

		const monthNames = [
			"Ene", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
		];

		if (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		)
		{
			// Same day
			const hour = date.getHours();
			const minutes = date.getMinutes();
			const amOrPm = hour >= 12 ? "pm" : "am";

			const formattedHour = (hour % 12 === 0 ? 12 : hour % 12).toString().padStart(2, "0");

			const formattedMinutes = minutes.toString().padStart(2, "0");
			return `${formattedHour}:${formattedMinutes}${amOrPm}`;
		}

		const formattedDay = date.getDate().toString().padStart(2,"0");
		const formattedMonth = monthNames[date.getMonth()];

		if (date.getFullYear() === today.getFullYear())
		{
			// Same year
			return `${formattedMonth} ${formattedDay}`;
		}

		const formattedYear = date.getFullYear().toString();
		return `${formattedMonth} ${formattedDay}, ${formattedYear}`;
	}


	static getDateFromValue(value:unknown):Date | null
	{
		let simple_date_regex = /^\d{4}(-\d\d){2}$/;
		let date_regex = /\d{4}(-\d\d){2}(T|\s)\d\d(:\d\d){2}/

		if( value instanceof Date )
		{
			return value;
		}
		else if( typeof value === "string" && date_regex.test( value ))
		{
			return Utils.getDateFromUTCMysqlString( value );
		}
		else if( typeof value === "string" && simple_date_regex.test( value.trim() ) )
		{
			return Utils.getDateFromLocalMysqlString( value.trim() );
		}

		return null;
	}

	static getDateString(value:any, include_time:boolean = true):string
	{
		let simple_date_regex = /^\d{4}(-\d\d){2}$/;

		let d:Date | null = null;
		let date_regex = /\d{4}(-\d\d){2}(T|\s)\d\d(:\d\d){2}/

		if( value instanceof Date )
		{
			d = value;
		}
		else if( typeof value === "string" && date_regex.test( value ))
		{
			d = Utils.getDateFromUTCMysqlString( value );
		}
		else if( typeof value === "string" && simple_date_regex.test( value.trim() ) )
		{
			d =Utils.getDateFromLocalMysqlString( value.trim() );
			let months = 'Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic'.split(',');
			return d.getDate()+'/'+months[ d.getMonth() ]+'/'+d.getFullYear();
		}

		if( d )
		{
			let months = 'Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic'.split(',');

			if( !include_time )
			{
				return d.getDate()+'/'+months[ d.getMonth() ]+'/'+d.getFullYear();
			}

			let hours = d.getHours();

			if( hours > 12 )
			{
				hours -= 12;
			}
			let ampm = d.getHours()>12 ?'PM':'AM';

			if( hours == 0 )
			{
				hours = 12;
			}

			return d.getDate()+'/'+months[ d.getMonth() ]+'/'+d.getFullYear()+' '+hours+':'+Utils.zero(d.getMinutes())+ampm;
		}
		return '';
	}
	public static distanceTo(point_a:Coordinates,point_b:Coordinates, radius=6371e3):number
	{
		// a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
		// δ = 2·atan2(√(a), √(1−a))
		// see mathforum.org/library/drmath/view/51879.html for derivation
		//https://www.movable-type.co.uk/scripts/latlong.html

		const R = radius;

		const φ1 = this.toRadians(point_a.lat);
		const λ1 = this.toRadians(point_a.lng);
		const φ2 = this.toRadians(point_b.lat);
		const λ2 = this.toRadians(point_b.lng);
		const Δφ = φ2 - φ1;
		const Δλ = λ2 - λ1;

		const a = Math.sin(Δφ/2)*Math.sin(Δφ/2) + Math.cos(φ1)*Math.cos(φ2) * Math.sin(Δλ/2)*Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		const d = R * c;

		return d;
	}

	public static toRadians(lat_or_lng:number):number
	{
		return lat_or_lng* Math.PI / 180;
	}

	public static generateRangeString(arr:number[]):string
	{
		if (arr.length === 0)
		{
			return '';
		}

		const sorted_arr = Array.from(new Set(arr)).sort((a,b) => a - b);
		const result = [];
		let start = sorted_arr[0];
		let count = 1;

		for (let i = 1; i < sorted_arr.length; i++)
		{
			if (sorted_arr[i] - sorted_arr[i - 1] === 1)
			{
				count++;
			} else
			{
				result.push(count === 1 ? start.toString() : `${start}-${count - 1}`);
				start = sorted_arr[i];
				count = 1;
			}
		}

		result.push(count === 1 ? start.toString() : `${start}-${count - 1}`);
		return result.join(',');
	}
}
