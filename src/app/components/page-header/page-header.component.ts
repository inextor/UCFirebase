import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent implements OnInit {
  isLoggedIn = false;

  ngOnInit(): void {
    this.checkSession();
  }

  checkSession() {
    const session = localStorage.getItem('session');
    this.isLoggedIn = !!session; // Check if session exists
  }

  logout() {
    localStorage.removeItem('session');
    this.isLoggedIn = false;
  }
}

