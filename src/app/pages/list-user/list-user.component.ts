import { Component, OnInit } from '@angular/core';
import { RestService, RestResponse } from '../../services/rest.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent implements OnInit {
    users: any[] = [];

    constructor(private restService: RestService) { }

    ngOnInit(): void {
        this.getUsers();
    }

    getUsers(): void {
        this.restService.getUsers().subscribe((response: RestResponse<any>) => {
            this.users = response.data;
        });
    }
}
