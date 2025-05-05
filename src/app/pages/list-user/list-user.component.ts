import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';
import { RestResponse } from '../../services/Rest';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent extends BaseComponent implements OnInit
{
    users: any[] = [];

    override ngOnInit(): void
    {
        this.getUsers();
    }

    getUsers(): void
    {
        this.rest.initRestSimple('user')
        .getAll()
        .subscribe((response: RestResponse<any>) =>
        {
            this.users = response.data;
        });
    }
}
