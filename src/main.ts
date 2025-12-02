// main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

// 1. IMPORT CÁC MODULE TOÀN CỤC CẦN THIẾT
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

// Import Component gốc
import { AppComponent } from './app/app.component';

// Import cấu hình định tuyến (Nếu bạn đã có file app.routes.ts)
// const routes: Routes = []; // Hoặc import từ file routes của bạn
import { routes } from './app/app.routes'; 

// Hàm khởi động ứng dụng Standalone
bootstrapApplication(AppComponent, {
  // CUNG CẤP CÁC DỊCH VỤ VÀ MODULE TOÀN CỤC
  providers: [
    
    // 2. Cung cấp Dịch vụ Định tuyến (Routing)
    // Cần thiết để Angular biết cách chuyển đổi giữa các Component dựa trên URL
    provideRouter(routes), 
    
    // 3. Cung cấp các Modules thông qua importProvidersFrom
    // Hàm này cho phép bạn sử dụng các Module dựa trên NgModule cũ
    // (như HttpClientModule, FormsModule) trong môi trường Standalone Component.
    importProvidersFrom(
      HttpClientModule, // Cho phép sử dụng HttpClient trong tất cả Service/Component
      FormsModule       // Cung cấp các tính năng của Forms toàn cục (Dùng cho [(ngModel)])
    ),
    
    // Bạn có thể thêm các providers khác ở đây (ví dụ: các services gốc)
  ]
}).catch(err => console.error(err));