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
  public danhSachSanPhamCoSan: ISanPham[] = [];
  public sanPhamChiTiet: ISanPham | undefined;
  public tongThanhTien: number = 0;
  public soluongThemmoi: number = 1;
  public giamGia: number = 50;
  public soHopDong: string = '';
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
    this.getDataCoSan();
    this.generateRandomCode();
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
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // 1. QUAN TRỌNG: Tô nền trắng trước
          // Vì JPEG không hỗ trợ trong suốt (transparency).
          // Nếu không làm bước này, các ảnh logo PNG tách nền sẽ bị nền đen.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Vẽ ảnh lên canvas
          ctx.drawImage(img, 0, 0);

          // 3. Chuyển đổi sang JPEG với độ nén 0.6 (giống như logic html2canvas)
          // Thay vì 'image/png' (rất nặng) -> dùng 'image/jpeg'
          const dataURL = canvas.toDataURL('image/jpeg', 0.6);

          resolve(dataURL);
        } else {
          reject(new Error('Không thể tạo context canvas'));
        }
      };

      img.onerror = (error) => {
        reject(error);
      };

      // Giữ nguyên logic tránh cache của bạn
      // Lưu ý: Nếu url đã có tham số (ví dụ: image.jpg?token=abc),
      // thì nên dùng logic kiểm tra để nối '&v=' thay vì '?v='
      img.src =
        url + (url.includes('?') ? '&' : '?') + 'v=' + new Date().getTime();
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
      this.getTongThanhTien(); // Hàm tính tổng thành tiền
    });
  }

  getDataCoSan() {
    this.sanphamService.getDanhSachSanPhamCoSan().subscribe((data) => {
      this.danhSachSanPhamCoSan = data;
    });
  }

  addSanPhamCoSan(data: ISanPham): void {
    
    const sanPhamMoi: ISanPham = {
      ...data,
      soluong: this.soluongThemmoi,
      thanhtien: (data.dongia || 1) * this.soluongThemmoi,
    };

    const checkSpTrung: ISanPham | undefined = this.danhSachSanPham.find(
      (sp) => sp.hangmuc === sanPhamMoi.hangmuc && sp.size === sanPhamMoi.size
    );
    if (checkSpTrung) {
      const updateSanPhamTrung: ISanPham = {
        ...checkSpTrung,
        soluong: (checkSpTrung.soluong || 0) + this.soluongThemmoi,
        dongia: checkSpTrung.dongia,
        thanhtien:
          ((checkSpTrung.soluong || 0) + this.soluongThemmoi) *
          (checkSpTrung.dongia || 0),
      };
      this.sanphamService
        .updateSanPham(updateSanPhamTrung.id, updateSanPhamTrung)
        .subscribe(() => {
          this.getData();
          this.isAddNew = false;
          this.isUpdate = false;
          this.soluongThemmoi = 1;
        });
    } else {
      this.sanphamService.addSanPham(sanPhamMoi).subscribe(() => {
        this.getData();
        this.isAddNew = false;
        this.isUpdate = false;
        this.soluongThemmoi = 1;
      });
    }
  }

  onChangeSoluong(event: any): void {
    const value = event.target.value;
    this.sanPham.soluong = Number(value);
    this.soluongThemmoi = Number(value);
  }

  deleteSanPham(id: string): void {
    this.sanphamService.deleteSanPham(id).subscribe(() => {
      this.getData();
    });
  }

  getRandomUpperCaseLetter(): string {
    // Mã ASCII của 'A' là 65, 'Z' là 90.
    // Math.random() * 26 tạo ra số thập phân từ 0 đến dưới 26.
    // Math.floor(...) đảm bảo nó là số nguyên.
    const asciiCode = 65 + Math.floor(Math.random() * 26);
    return String.fromCharCode(asciiCode);
  }

  getRandomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      // Math.random() * 10 tạo ra số từ 0 đến dưới 10.
      // Math.floor(...) đảm bảo nó là số nguyên từ 0 đến 9.
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  generateRandomCode(): string {
    // 1. Tạo 2 ký tự chữ cái đầu (XX)
    const letters =
      this.getRandomUpperCaseLetter() + this.getRandomUpperCaseLetter(); // Ví dụ: "BG"

    // 2. Tạo 4 chữ số giữa (YYYY)
    const digitsPart1 = this.getRandomDigits(4); // Ví dụ: "1225"

    // 3. Tạo 4 chữ số cuối (ZZZ)
    const digitsPart2 = this.getRandomDigits(4); // Ví dụ: "001"

    // 4. Kết hợp tất cả lại theo định dạng "XX-YYYY-ZZZ"
    const result = `${letters}-${digitsPart1}-${digitsPart2}`;
    this.soHopDong = result;
    return result;
  }

  // Hàm xử lý khi chọn file (Đã nâng cấp để nén ảnh)
  onFileSelected(event: any, sanpham: ISanPham): void {
    const file = event.target.files[0];

    if (file) {
      // Gọi hàm nén ảnh trước khi gán
      this.compressImage(file, 0.15, 500)
        .then((base64) => {
          // 0.5 là chất lượng (50%), 500 là chiều rộng tối đa (px)
          sanpham.img = base64;
        })
        .catch((err) => {
          console.error('Lỗi nén ảnh:', err);
        });
    }
  }

  /**
   * Hàm nén ảnh và chuyển sang Base64
   * @param file File ảnh gốc
   * @param quality Chất lượng nén (0.1 - 1.0)
   * @param maxWidth Chiều rộng tối đa cho phép (px)
   */
  compressImage(
    file: File,
    quality: number,
    maxWidth: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          // Tạo canvas để vẽ lại ảnh với kích thước nhỏ hơn
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Tính toán tỉ lệ để thu nhỏ nếu ảnh quá to
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Vẽ nền trắng (đề phòng ảnh PNG trong suốt bị đen)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            ctx.drawImage(img, 0, 0, width, height);

            // Chuyển sang JPEG với độ nén cao
            const compressedData = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedData);
          } else {
            reject('Không thể tạo context canvas');
          }
        };
      };

      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Hàm thêm khoảng trắng để tránh cắt dòng xấu
   */
  addPageBreaks() {
    // 1. Lấy phần tử bao quanh nội dung in
    const element = document.getElementById('xuat-pdf');
    // const rows = element.querySelectorAll('tr, .footer-block');
    if (!element) return;

    // 2. Lấy tất cả các thẻ TR trong bảng và các thẻ DIV quan trọng (như chữ ký, footer)
    // Bạn có thể thêm class .no-cut vào các thẻ div chữ ký nếu muốn nó không bị cắt
    const rows = element.querySelectorAll('tr, .card, .row, .footer-block');

    // 3. Tính chiều cao một trang A4 theo Pixel (trên màn hình hiện tại)
    // A4 width = 210mm, height = 297mm. Tỷ lệ = 1.414
    const contentWidth = element.offsetWidth;
    const pageHeight = contentWidth * 1.414; // Chiều cao A4 tính theo px tại thời điểm này

    let accumulatedHeight = 0; // Tổng chiều cao đã duyệt qua
    let pageCount = 1;

    // 4. Duyệt qua từng phần tử để kiểm tra
    rows.forEach((row: any) => {
      // Reset margin cũ (nếu có) để tính toán lại từ đầu
      row.style.marginTop = '0px';

      const rowHeight = row.offsetHeight;
      const rowTop = row.offsetTop;

      // Tính vị trí kết thúc của dòng hiện tại
      const rowBottom = rowTop + rowHeight;

      // Vị trí "biên giới" của trang giấy hiện tại
      const pageBoundary = pageCount * pageHeight;

      // 5. KIỂM TRA QUAN TRỌNG:
      // Nếu dòng hiện tại bắt đầu trước biên giới, nhưng kết thúc sau biên giới
      // => Tức là nó đang nằm đè lên vạch cắt
      if (rowTop < pageBoundary && rowBottom > pageBoundary) {
        // Tính khoảng cách cần đẩy xuống trang sau
        const marginNeeded = pageBoundary - rowTop;

        // Thêm margin-top để đẩy dòng này sang trang mới
        // Cộng thêm 20px để có khoảng hở đẹp ở đầu trang
        row.style.marginTop = marginNeeded + 20 + 'px';

        // Tăng số trang lên vì nội dung đã bị đẩy xuống
        pageCount++;
      }
    });
  }

  /**
   * Hàm dọn dẹp sau khi in (trả lại giao diện cũ)
   */
  removePageBreaks() {
    const element = document.getElementById('xuat-pdf');
    if (!element) return;
    const rows = element.querySelectorAll('tr, .card, .row');
    rows.forEach((row: any) => {
      row.style.marginTop = '0px';
    });
  }

  public xuatPDF(): void {
    const data = document.getElementById('xuat-pdf');
    this.addPageBreaks();
    if (data) {
      // 1. GIẢM SCALE: Thay vì 2, hãy dùng 1.5 (vừa đủ nét) hoặc 1 (nhẹ nhất)
      // Thêm backgroundColor: '#ffffff' để khi chuyển sang JPEG nền không bị đen
      setTimeout(() => {
        html2canvas(data, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
        }).then((canvas) => {
          const imgWidth = 210;
          const pageHeight = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          const pdf = new jsPDF('p', 'mm', 'a4');
          let position = 0;

          // 2. CHUYỂN SANG JPEG VÀ NÉN:
          // 'image/jpeg': Định dạng nén
          // 0.6: Chất lượng ảnh (từ 0 đến 1). 0.6 là mức cân bằng tốt giữa dung lượng và độ nét.
          const imgData = canvas.toDataURL('image/jpeg', 0.5);

          // In trang đầu tiên
          // Tham số 'FAST' giúp jsPDF xử lý nhanh hơn
          pdf.addImage(
            imgData,
            'JPEG',
            0,
            position,
            imgWidth,
            imgHeight,
            undefined,
            'FAST'
          );
          heightLeft -= pageHeight;

          // Vòng lặp in các trang tiếp theo
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(
              imgData,
              'JPEG',
              0,
              position,
              imgWidth,
              imgHeight,
              undefined,
              'FAST'
            );
            heightLeft -= pageHeight;
          }

          pdf.save('Hop-dong-bao-gia.pdf');
          this.removePageBreaks();
        });
      }, 250);
    }
  }
}
