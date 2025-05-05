import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { Router,ActivatedRoute, ParamMap} from "@angular/router" //,Params
import { Location } from	'@angular/common';
import { Title } from '@angular/platform-browser';
import { Rest, RestResponse, SearchObject } from 'src/app/services/Rest';
import { ErrorMessage, Utils } from 'src/app/classes/Utils';
import { SubSink } from 'subsink';
import { ConfirmationService } from 'src/app/services/confirmation.service';

import { combineLatest,CompletionObserver,forkJoin,Observable, of, Unsubscribable } from 'rxjs';
import { mergeMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-base',
  imports: [],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})

export class BaseComponent implements OnInit, OnDestroy
{
	public is_loading:boolean	= false;

	public total_pages:number	= 0;
	public total_items: number	= 0;
	public current_page:number	= 0;
	public pages:number[]		= [];
	public page_size:number		= 50;
	public path:string			= '';
	public error_message:string | null		= null;
	public success_message:string | null	= null;
	public warning_message:string | null	= null;
	public subs:SubSink	= new SubSink();
	public sort_indicators:Record<string,boolean> = { };

	constructor(public rest: RestService, public confirmation:ConfirmationService, public router: Router, public route: ActivatedRoute, public location: Location, public titleService: Title)
	{
		if( window.document.body.clientWidth < 1200 )
			this.rest.hideMenu();
	}

	ngOnInit() { }

	ngOnDestroy()
	{
		//console.log('destroying');
		this.subs.unsubscribe();
	}

	set sink(s:Unsubscribable )
	{
		this.subs.sink = s;
	}

	setPages(current_page:number,totalItems:number)
	{
		this.current_page = current_page;
		this.pages.splice(0,this.pages.length);
		this.total_items = totalItems;

		if( ( this.total_items % this.page_size ) > 0 )
		{
			this.total_pages = Math.floor(this.total_items/this.page_size)+1;
		}
		else
		{
			this.total_pages = this.total_items/this.page_size;
		}

		for(let i=this.current_page-5;i<this.current_page+5;i++)
		{
			if( i >= 0 && i<this.total_pages)
			{
				this.pages.push( i );
			}
		}

		this.is_loading = false;
		//this.rest.scrollTop();
	}

	/*
	simpleSortSearch(parameter:string,item_search:SearchObject<any>)
	{
		let asc:string = parameter+'_ASC';
		let desc:string = parameter+'_DESC';

		if( desc in this.sort_indicators && this.sort_indicators[desc] )
		{
			this.sort_indicators[desc] = false;
			this.sort_indicators[asc] = true;
			item_search.sort_order.unshift(asc);
		}
		else if( asc in this.sort_indicators && this.sort_indicators[asc])
		{
			this.sort_indicators[asc] = false;
			this.sort_indicators[desc] = true;
		}
		else
		{
			this.sort_indicators[asc] = true;
		}

		if(item_search.sort_order.length>5)
		{
			item_search.sort_order.pop();
		}

		item_search.page = 0;

		this.search(item_search);
	}
	*/

	getSearchExtra(params:ParamMap,extra_keys:string[]):Record<string,string|null|Date>
	{
		if(extra_keys == null )
			return {};

		let search_extra:Record<string,string|null|Date> = {};

		extra_keys.forEach((i:string)=>
		{
			if( params.has('search_extra.'+i ) )
			{
				let v = params.get('search_extra.'+i ) === 'null' ? null : params.get('search_extra.'+i);

				if( /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test( v ) )
				{
					let components = v.split(/T|-|:|\s/g);
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
					search_extra[ i ] = localTime;
					return;
				}

				console.log('Para ',i,'MAMO');

				search_extra[ i ] = params.get('search_extra.'+i ) === 'null' ? null : params.get('search_extra.'+i);
			}
			else
			{
				search_extra[ i ] = null;
			}
		});

		return search_extra;
	}

	downloadAll<U,T>(rd:Rest<U,T>,obj_search:SearchObject<U>,as_post:boolean = false):Observable<RestResponse<T>>
	{
		this.is_loading = true;

		const SEARCH_LIMIT = 100;
		let search:SearchObject<U> = {...obj_search, limit: SEARCH_LIMIT };

		let first_observable = as_post ? rd.searchAsPost( search ) : rd.search( search );

		return first_observable
		.pipe
		(
			mergeMap((response)=>
			{
				let observables = [ of(response) ];
				let pages_needed = Math.ceil( response.total/SEARCH_LIMIT );

				for(let i=1;i<pages_needed;i++)
				{
					let s:SearchObject<U> = this.getEmptySearch();
					s = { ...search, limit: SEARCH_LIMIT, page: i };
					s.limit = SEARCH_LIMIT;
					s.page = i;

					//console.log('Searching page', s);
					observables.push( as_post ? rd.searchAsPost(s ) : rd.search( s ) );
				}

				return forkJoin( observables );
			}),
			mergeMap((responses:RestResponse<T>[])=>
			{
				let items = responses.reduce((p,c)=>
				{
					p.push(...c.data );
					return p;
				},[]);

				let item_response:RestResponse<T> = {
					total: items.length,
					data: items
				};
				return of( item_response );
			})
		);
	}

	getCombinedSearch<T>(pm:ParamMap, qpm:ParamMap,fields:string[]=[],extra_keys:string[]=[]):SearchObject<T>
	{
		let keys:string[] = ['eq','le','lt','ge','gt','csv','lk','nn','start','ne'];
		let item_search:any = this.getEmptySearch();

		let pm_array = [qpm,pm ];

		for(let param_map of pm_array )
		{
			extra_keys.forEach((i:string)=>
			{
				if( param_map.has('search_extra.'+i ) )
				{
					item_search.search_extra[ i ] = param_map.get('search_extra.'+i ) === 'null' ? null : param_map.get('search_extra.'+i);
				}
				else if( !item_search.search_extra[ i ] )
				{
					item_search.search_extra[ i ] = null;
				}
			});

			keys.forEach((k:string)=>
			{
				item_search[k] ={};

				fields.forEach((f:string)=>
				{
					let field = k+"."+f;

					if( param_map.has(field) )
					{
						let value_to_assign = param_map.get( field );
						if( value_to_assign === 'null' )
						{
							item_search[k][ field ] = null
						}
						else if( value_to_assign == null )
						{
							item_search[ field ] = null
						}
						else
						{
							if( f == 'created' || f =='updated' )
							{
								let value = param_map.get(field);

								if( value && value !='null' )
								{
									item_search[k][f] = Utils.getDateFromUTCMysqlString( value );
								}
								return;
							}
							/*else */
							if( k == 'csv' )
							{
								let v = param_map.get(field);
								let array = (''+v).split(',');
								item_search.csv[f] = array.length == 1 && array[0] == '' ? [] : array;
							}
							else
							{
								let z	= parseInt(value_to_assign);

								if( /.*_id$/.test( field ) && !Number.isNaN(z) )
								{
									item_search[ k ][ f ] = z;
								}
								else if( field )
								{
									item_search[ k ][ f ] = param_map.get( field );
								}
							}
						}
					}
					else
					{
						item_search[ k ][ f ] = null;
					}
				});
			});

			if( param_map.has('sort_order') )
			{
				item_search.sort_order = param_map.get('sort_order').split(',');
			}
		}

		let page_str:string | null = qpm.get('page');
		item_search.page = page_str ? parseInt( page_str ) as number : 0;
		item_search.limit = this.page_size;

		if( item_search.page == NaN )
			item_search.page = 0;

		return item_search as SearchObject<T>;
	}

	getSearch<T>(param_map:ParamMap, fields:string[],extra_keys:string[]=[]):SearchObject<T>
	{
		let keys:string[] = ['eq','ne','le','lt','ge','gt','csv','lk','nn','start','range'];
		let item_search:any = this.getEmptySearch();

		extra_keys.forEach((i:string)=>
		{
			if( param_map.has('search_extra.'+i ) )
			{
				let v = param_map.get('search_extra.'+i ) === 'null' ? null : param_map.get('search_extra.'+i);

				if( i.includes('timestamp') || i.includes('system') )
				{
					if( /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test( v ) )
					{
						let components = v.split(/T|-|:|\s/g);

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
						item_search.search_extra[ i ] = localTime;// Utils.getLocalMysqlStringFromDate( localTime );
						return;
					}
				}

				item_search.search_extra[ i ] = v;
			}
			else
			{
				item_search.search_extra[ i ] = null;
			}
		});

		keys.forEach((k:string)=>
		{
			item_search[k] ={};

			fields.forEach((f:string)=>
			{
				let field = k+"."+f;

				if( param_map.has(field) )
				{
					let value_to_assign = param_map.get( field );
					if( value_to_assign === 'null' )
					{
						item_search[k][ field ] = null;
					}
					else if( value_to_assign === null || value_to_assign === undefined )
					{
						item_search[ field ] = null
					}
					else
					{
						if( f == 'created' || f =='updated' )
						{
							let value = param_map.get(field);

							if( value && value !='null' )
							{
								item_search[k][f] = Utils.getDateFromUTCMysqlString( value );
							}
							return;
						}

						if( f.includes('timestamp') || f.includes('system') )
						{
							let value = param_map.get(field);
							if( /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test( value ) )
							{
								item_search[k][f] = Utils.getDateFromUTCMysqlString( value );
							}
							else
							{
								item_search[k][f] = null;
							}
							return;
						}
						/*else */
						if( k == 'csv' )
						{
							let v = param_map.get(field);
							let array = (''+v).split(',');
							item_search.csv[f] = array.length == 1 && array[0] == '' ? [] : array;
						}
						else if( k == 'range' )
						{
							// TODO
							item_search.range[f] = [];
						}
						else
						{
							let z	= parseInt(value_to_assign);

							if( /.*_id$/.test( field ) && !Number.isNaN(z) )
							{
								item_search[ k ][ f ] = z;
							}
							else if( field )
							{
								item_search[ k ][ f ] = param_map.get( field );
							}
						}
					}
				}
				else
				{
					item_search[ k ][ f ] = null;
				}
			});
		});

		if( param_map.has('sort_order') )
		{
			item_search.sort_order = param_map.get('sort_order').split(',');
		}

		let page_str:string | null = param_map.get('page');
		item_search.page = page_str ? parseInt( page_str ) as number : 0;
		item_search.limit = this.page_size;

		if( item_search.page == NaN )
			item_search.page = 0;

		return item_search as SearchObject<T>;
	}

	getEmptySearch<T>():SearchObject<T>
	{
		let item_search:SearchObject<T> = {
			eq:{} as T,
			le:{} as T,
			lt:{} as T,
			ge:{} as T,
			gt:{} as T,
			lk:{} as T,
			nn:[] as string[],
			sort_order:[] as string[],
			start:{} as T,
			ends:{} as T,
			csv:{},
			range:{},
			ne:{} as T,
			is_null:[],
			search_extra: {} as Record<string,string|null|number|Date>,
			page:0,
			limit: this.page_size
		};
		return item_search;
	}

	getPathAndQuery(item_search:Partial<SearchObject<any>> | null = null):string
	{
		let search:Record<string,string|null> = {};

		for(let i in item_search.search_extra )
		{
			if( item_search.search_extra[ i ] && item_search.search_extra[ i ] !== 'null' )
				search['search_extra.'+i] = ''+item_search.search_extra[ i ];
		}

		let str:string = ''+this.path;

		if( item_search != null )
		{
			item_search.page = 0;

			let array = ['eq','ne','le','lt','ge','gt','csv','lk','nn','start'];

			let i: keyof typeof item_search;

			for(i in item_search )
			{
				if(array.indexOf( i ) > -1 )
				{
					let ivalue = item_search[i] as any;
					let j: keyof typeof ivalue;

					let foo:string[] = [];

					for(j in ivalue)
						if( ivalue[j] !== null && ivalue[j] !== 'null')
							foo.push( encodeURIComponent(i+'.'+j)+'='+encodeURIComponent(ivalue[j]) );

					str+= '?'+foo.join('&');
				}
			}
		}
		return str;
	}

	search(item_search:Partial<SearchObject<any>> | null = null )
	{
		console.log('WTF with this search',item_search);

		let to_search = item_search == null ? this.getEmptySearch() : item_search;

		let search:Record<string,string|null> = {};

		for(let i in to_search.search_extra )
		{
			if( to_search.search_extra[ i ] && to_search.search_extra[ i ] !== 'null' )
			{
				let v = to_search.search_extra[ i ] as any;
				if( (v instanceof Date) )
				{
					search['search_extra.'+i] = Utils.getUTCMysqlStringFromDate( v );
				}
				else
				{
					search['search_extra.'+i] = ''+to_search.search_extra[ i ];
				}
			}
		}

		if( to_search != null )
		{
			to_search.page = 0;

			let array = ['eq','ne','le','lt','ge','gt','csv','lk','nn','start'];

			let i: keyof typeof to_search;

			for(i in to_search )
			{
				if(array.indexOf( i ) > -1 )
				{
					let ivalue = to_search[i] as any;
					let j: keyof typeof ivalue;

					for(j in ivalue)
					{
						let value = ivalue[j];

						if( value !== null && value !== 'null' && value !== undefined )
						{
							if( value instanceof Date )
							{
								search[i+'.'+j] = Utils.getUTCMysqlStringFromDate( value );
							}
							else
							{
								//Non Null assertion operator (! )
								//https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html
								search[i+'.'+j] = ''+value!;
							}
						}
					}
				}
			}
		}

		if('sort_order' in item_search && item_search.sort_order.length )
		{
			search['sort_order']=item_search.sort_order.join(',');
		}

		this.router.navigateByUrl('/',{skipLocationChange: true})
		.then(()=>
		{
			this.router.navigate([this.path],{queryParams: search});
		});
	}

	searchNoForceReload(item_search:Partial<SearchObject<any>> | null = null )
	{
		let search:Record<string,string|null> = {};

		for(let i in item_search.search_extra )
		{
			if( item_search.search_extra[ i ] && item_search.search_extra[ i ] !== 'null' )
			{
				let v = item_search.search_extra[ i ] as any;
				if( (v instanceof Date) )
				{
					search['search_extra.'+i] = Utils.getUTCMysqlStringFromDate( v );
				}
				else
				{
					search['search_extra.'+i] = ''+item_search.search_extra[ i ];
				}

			}
		}

		if( item_search != null )
		{
			item_search.page = 0;

			let array = ['eq','le','lt','ge','gt','csv','lk','nn','start'];

			let i: keyof typeof item_search;

			for(i in item_search )
			{
				if(array.indexOf( i ) > -1 )
				{
					let ivalue = item_search[i] as any;
					let j: keyof typeof ivalue;

					for(j in ivalue)
					{
						if( ivalue[j] !== null && ivalue[j] !== 'null'&&ivalue[j] !== undefined)
						{
							let value = ivalue[j];

							if( value !== null && value !== 'null' && value !== undefined )
							{
								if( value instanceof Date )
								{
									search[i+'.'+j] = Utils.getUTCMysqlStringFromDate( value );
								}
								else
								{
									search[i+'.'+j] = ''+value!;
								}
							}
						}
					}
				}

			}
		}

		this.router.navigate([this.path],{queryParams: search});
	}


	showSuccess(str:string):void
	{
		this.is_loading = false;
		this.rest.showErrorMessage(new ErrorMessage( str,'alert-success', true ));
	}

	showError(error:any):void
	{
		this.is_loading = false;
		this.rest.showError(error, true);
	}
	showWarning(str:string):void
	{
		this.rest.showErrorMessage(new ErrorMessage( str,'alert-warning', true ));
	}

	public setTitle(newTitle: string)
	{
		this.titleService.setTitle(newTitle);
	}

	onDateChange(date:string,obj:any, attr:string,hour='', seconds:number =0)
	{
		if( date == '' )
		{
			obj[attr] = null;
			return;
		}

		let d_str = date.trim();
		if( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test( d_str ) )
		{
			d_str = date.trim()+':00';
		}

		if( hour != '')
		{
			d_str = date.substring(0,10)+' '+hour;
		}

		let d = Utils.getLocalDateFromMysqlString( d_str );

		if( seconds )
		{
			d.setSeconds( seconds );
		}

		obj[attr] = d;
		return;
	}


	getQueryParamObservable():Observable<ParamMap[]>
	{
		let p:ParamMap = {
			has:(_prop)=>false,
			keys:[],
			get:(_value:string)=>{ return null},
			getAll:()=>{ return []},
		};

		return combineLatest
		([
			this.route.queryParamMap.pipe(startWith(p)),
			this.route.paramMap
		])
	}

	applySortOrderFromArray(header:string,sort_order:string[])
	{
		sort_order.splice(4,Infinity);

		let index = sort_order.findIndex((i)=>{
			let clean = i.replaceAll(/_DESC|_ASC/g,'')
			return clean == header;
		});

		if( index == -1 )
		{
			sort_order.unshift( header+'_ASC');
		}
		else if( index == 0 )
		{
			if(sort_order[0] == header+'_ASC' )
			{
				sort_order[0] = header+'_DESC';
			}
			else
			{
				sort_order[0] = header+'_ASC';
			}
		}
		else
		{
			sort_order.splice( index )
			sort_order.unshift( header+'_ASC' );
		}
	}

	sort(header:string,search:SearchObject<any>)
	{
		this.applySortOrderFromArray(header,search.sort_order)
		search.page = 0;
		this.search( search );
	}

	onUpdatePropertyEmptyAsNull(obj:any, prop_name:string, value:any )
	{
		if( value === '' )
		{
			obj[prop_name] = null;
			return;
		}
		obj[prop_name] = value;
	}

	onChangeCheckbox(value:boolean,obj:any,prop:string)
	{
		obj[prop] = value;
	}

	onSubscriptionSuccess<T>(Obserbable:Observable<T>,callback:(value:T)=>void)
	{
		this.sink = Obserbable.subscribe
		({
			next:(value:T)=>
			{
				this.is_loading = false;
				callback(value);
			},
			error:(error)=>
			{
				console.log( error );
				this.showError( error )
			}
		});
	}

	getObserver<T>(fn_success:(value:T)=>void, fn_error:(error:any)=>void):CompletionObserver<T>
	{
		return { next: fn_success, error: fn_error, complete: () => {} };
	}
}
