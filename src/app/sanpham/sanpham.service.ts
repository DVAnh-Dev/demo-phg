import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // 'root' giúp service này có thể dùng được ở mọi nơi trong dự án
})
export class SanphamService {
  // Đường dẫn API của bạn
  private apiUrl = 'https://692da10fe5f67cd80a4c4f33.mockapi.io/sanpham';

  // Tiêm HttpClient vào Service
  constructor(private http: HttpClient) {}

  // Hàm lấy danh sách sản phẩm
  // Trả về một Observable (Luồng dữ liệu) chứa mảng any
  getDanhSachSanPham(): Observable<ISanPham[]> {
    return this.http.get<ISanPham[]>(this.apiUrl);
  }

  addSanPham(sanpham: ISanPham): Observable<ISanPham> {
    return this.http.post<ISanPham>(this.apiUrl, sanpham);
  }

  deleteSanPham(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSanPham(id: string, sanpham: ISanPham): Observable<ISanPham> {
    return this.http.put<ISanPham>(`${this.apiUrl}/${id}`, sanpham);
  }
}

export interface ISanPham {
  hangmuc: string;
  size: string;
  mota: string;
  img: string;
  dongia: number;
  soluong: number;
  donvi: string;
  vitri: string;
  ghichu: string;
  thanhtien: number;
  id: string;
}
