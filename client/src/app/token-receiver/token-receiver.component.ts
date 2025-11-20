import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-token-receiver',
  template: `
    <div class="token-receiver-container">
      <p>正在處理認證...</p>
    </div>
  `,
  styles: [`
    .token-receiver-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 16px;
      color: #666;
    }
  `]
})
export class TokenReceiverComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 從 query parameters 取得 token
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        // 將 token 存入 localStorage
        localStorage.setItem('token', token);
        console.log('Token received and stored successfully');

        // 重新導向到首頁或其他頁面
        this.router.navigate(['/home']);
      } else {
        console.error('No token provided');
        // 如果沒有 token，可以重導到登入頁或顯示錯誤
        this.router.navigate(['/']);
      }
    });
  }
}
