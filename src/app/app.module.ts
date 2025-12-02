import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Dùng cho Two-way binding và Forms
import { HttpClientModule } from '@angular/common/http'; // Dùng để gọi API (HTTP requests)
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SanphamService } from './sanpham/sanpham.service';
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
  ],
  providers: [
    SanphamService
  ],
})
export class AppModule {}
