import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';
import { RestResponse } from '../../services/Rest';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent extends implements OnInit
{
    users: any[] = [];

    constructor(private restService: RestService)
    {

    }

    ngOnInit(): void
    {
        this.getUsers();
    }

    getUsers(): void
    {
        this.restService.initRestSimple('user')
        .getAll()
        .subscribe((response: RestResponse<any>) =>
        {
            this.users = response.data;
        });
    }
}
