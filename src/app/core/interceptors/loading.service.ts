import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Biến lưu trạng thái loading (Mặc định là false - tắt)
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Hàm bật
  show() {
    this.isLoading.next(true);
  }

  // Hàm tắt
  hide() {
    this.isLoading.next(false);
  }
}
