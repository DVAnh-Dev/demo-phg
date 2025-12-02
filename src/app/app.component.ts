import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SanphamComponent } from './sanpham/sanpham.component';
import { CommonModule } from '@angular/common'; // Cần để dùng *ngFor
import { LoadingService } from './core/interceptors/loading.service';
// import { AppModule } from './app.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SanphamComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'demo-phg';
    ngOnInit(): void {
    // this.getData();
  }
  constructor(public loadingService: LoadingService) {}
}
