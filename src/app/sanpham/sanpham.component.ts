import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Cần để gọi API
import { ISanPham, SanphamService } from './sanpham.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-sanpham',
  standalone: true,
  imports: [CommonModule, FormsModule], // Nhớ import CommonModule
  templateUrl: './sanpham.component.html',
  styleUrl: './sanpham.component.css',
})
export class SanphamComponent implements OnInit {
  public isAddNew: boolean = false;
  public isUpdate: boolean = false;
  public danhSachSanPham: ISanPham[] = [];
  public sanPhamChiTiet: ISanPham | undefined;
  public tongThanhTien: number = 0;
  public giamGia: number = 50;
  public ngayHienTai = new Date();
  public sanPham: ISanPham = {
    hangmuc: '',
    size: '',
    mota: '',
    img: '',
    dongia: 0,
    soluong: 1,
    donvi: '',
    vitri: '',
    ghichu: '',
    thanhtien: 0,
    id: '',
  };
  public thongTinKhachHang = {
    ten: '',
    diaChi: '',
    sdt: '',
    email: '',
  };
  constructor(
    private http: HttpClient,
    private sanphamService: SanphamService
  ) {}

  // Hàm này chạy ngay khi Component được sinh ra
  ngOnInit(): void {
    this.getData();
  }

  addSanPham(): void {
    this.isAddNew = true;
  }

  update(id: string, data: ISanPham): void {
    this.sanPham = { ...data };
    this.sanPham.id = id;
    this.isUpdate = true;
  }

  updateSanPham(id: string, data: ISanPham): void {
    const sanPhamNew: ISanPham = {
      hangmuc: '',
      size: '',
      mota: '',
      img: '',
      dongia: 0,
      soluong: 1,
      donvi: '',
      vitri: '',
      ghichu: '',
      thanhtien: 0,
      id: '',
    };
    if (!id) {
      // console.error('ID sản phẩm không hợp lệ');
      this.isAddNew = false;
      this.isUpdate = false;
      return;
    }
    this.sanphamService.updateSanPham(id, data).subscribe(() => {
      this.getData();
      this.isAddNew = false;
      this.isUpdate = false;
      this.sanPham = sanPhamNew;
    });
  }
  // Hàm hỗ trợ chuyển URL thành Base64
  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous'); // Quan trọng
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      // Thêm tham số ngẫu nhiên để tránh cache nếu cần
      img.src = url + '?v=' + new Date().getTime();
    });
  }
  saveSanPham(): void {
    if (this.isUpdate) {
      this.updateSanPham(this.sanPham.id, this.sanPham);
      this.getData();
      this.isUpdate = false;
      this.isAddNew = false;

      return;
    } else {
      this.sanphamService.addSanPham(this.sanPham).subscribe((data) => {
        this.getData();
        this.isAddNew = false;
        this.isUpdate = false;
      });
    }
  }

  tinhThanhTien(): void {
    const gia = this.sanPham.dongia || 0;
    const sl = this.sanPham.soluong || 0;
    this.sanPham.thanhtien = Number(gia) * Number(sl);
  }

  getTongThanhTien(): void {
    let tong = 0;
    for (const item of this.danhSachSanPham) {
      tong += item.thanhtien || 0;
    }
    this.tongThanhTien = tong;
  }

  getData() {
    this.sanphamService.getDanhSachSanPham().subscribe((data) => {
      this.danhSachSanPham = data;
      this.getTongThanhTien();
      this.danhSachSanPham.forEach((sp) => {
        if (sp.img && sp.img.startsWith('http')) {
          this.getBase64ImageFromURL(sp.img)
            .then((base64Data) => {
              sp.img = base64Data; // Thay thế link ảnh gốc bằng chuỗi Base64
            })
            .catch((err) => console.error('Lỗi load ảnh:', err));
        }
      });
    });
  }
  deleteSanPham(id: string): void {
    this.sanphamService.deleteSanPham(id).subscribe(() => {
      this.getData();
    });
  }

  public xuatPDF(): void {
    // 1. Thay đổi mục tiêu: Lấy toàn bộ body hoặc phần tử bao quanh lớn nhất
    const data = document.body; // Hoặc document.getElementById('main-container') nếu bạn có

    if (data) {
      // Tăng scale lên 2 hoặc 3 để ảnh nét hơn khi in nhiều trang
      html2canvas(data, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
      }).then((canvas) => {
        // 2. Thiết lập kích thước A4 (đơn vị mm)
        const imgWidth = 210;
        const pageHeight = 297;

        // 3. Tính chiều cao thực tế của nội dung web khi quy đổi ra khổ A4
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Biến lưu chiều cao còn lại chưa in
        let heightLeft = imgHeight;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0; // Vị trí bắt đầu vẽ ảnh (trục Y)

        // 4. In trang đầu tiên
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight; // Trừ đi phần đã in

        // 5. Vòng lặp: Nếu vẫn còn nội dung (heightLeft > 0) thì thêm trang mới
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight; // Tính toán vị trí đẩy ảnh lên trên

          pdf.addPage(); // Thêm trang trắng mới

          // Vẽ lại ảnh đó nhưng vị trí (position) đã bị đẩy lên cao (số âm)
          // Điều này tạo hiệu ứng "cuộn" xuống phần tiếp theo của ảnh
          pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            0,
            position,
            imgWidth,
            imgHeight
          );

          heightLeft -= pageHeight; // Tiếp tục trừ đi phần đã in
        }

        // 6. Lưu file
        pdf.save('Hoa_Don_Chi_Tiet.pdf');
      });
    }
  }
}
