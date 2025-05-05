import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  username = '';
  password = '';
  http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  login() {
    const payload = {
      username: this.username,
      password: this.password,
    };
    
    this.http
      .post('https://trikitrakes.integranet.xyz/api/login.php', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          try {
            const responseJson = JSON.parse(JSON.stringify(response));
            const session = responseJson.session;
            localStorage.setItem('session', session);
            console.log('Session stored:', session);

          } catch (error) {
            console.error('Error parsing JSON response:', error);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        },
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
