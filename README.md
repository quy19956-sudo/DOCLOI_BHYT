# Tra lỗi XML cho Android

[Tải APK 1.1 đã ký](TraLoiXML-1.1.apk). Mở tệp trên điện thoại để cài đặt hoặc cập nhật phiên bản 1.0.

Ứng dụng đọc nhiều tệp Excel ngay trên thiết bị. Chọn tệp, chọn khoa và loại kết quả để xem lỗi chi tiết, thống kê theo khoa hoặc hồ sơ có lỗi. Mở nguồn đối chiếu để xem tệp, trang tính và dòng Excel.

## Tạo APK

Trên Linux, cài JDK 17, zip, Android SDK Platform 34 và Build Tools 35.0.0. Đặt ANDROID_HOME đến thư mục SDK, chạy `bash build.sh`. GitHub Actions cũng thực hiện quy trình này khi đẩy commit. Tệp tạo ra là `build/TraLoiXML-unsigned.apk`. Để cài lên điện thoại, ký bằng apksigner. Để cập nhật đè bản 1.1 đã phát hành, cần khóa ký của bản đó.

## Mã nguồn

- `src/` chứa Activity Android và trình chọn tệp.
- `assets/index.html` chứa giao diện và mã Worker được nhúng để đọc Excel ngoại tuyến.
- `assets/reader.js` nhận diện bảng và tạo danh sách kết quả. Sau khi sửa, chạy `python3 sync_worker.py` trước khi build.
- SheetJS 0.20.3 được nhúng trong Worker. Giấy phép nằm ở `assets/LICENSE`.
