import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-list-products',
	imports: [CommonModule],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent implements OnInit
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

