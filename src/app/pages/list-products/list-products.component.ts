import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-list-products',
	imports: [CommonModule, PageHeaderComponent],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent extends BaseComponent implements OnInit
{
    item_info_list:any[] = [];

		ngOnInit(): void
		{

			fetch('https://uniformesprofesionales.integranet.xyz/api/item_info.php?limit=20')
			.then((response)=>
			{
				return response.json();
			})
			.then((response)=>
			{
				this.item_info_list = response.data;
			});
}
}

