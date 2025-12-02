import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../interceptors/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inject Service vào
  const loadingService = inject(LoadingService);

  // 2. Bật Loading ngay lập tức khi request bắt đầu
  loadingService.show();

  // 3. Xử lý request và tắt loading khi hoàn tất (finalize)
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};