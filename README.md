# Music Research System

Ứng dụng nhỏ bằng Flask để tìm kiếm và gợi ý bài hát dựa trên đặc trưng âm nhạc (audio features).

Ứng dụng đọc dữ liệu từ `data/data.csv`, chuẩn hoá các feature numeric và dựng một ANN index (Annoy) để tìm các bài hát tương đồng. Ngoài ra ứng dụng hỗ trợ tìm kiếm fuzzy tên bài hát bằng `rapidfuzz`.

## Tính năng chính

- Lấy danh sách bài hát nổi tiếng (theo `popularity`).
- Tìm kiếm tên bài hát với fuzzy matching.
- Gợi ý bài hát tương tự dựa trên vector đặc trưng âm nhạc (ANN + cosine-like similarity).

## Yêu cầu

- Python 3.8+
- Các thư viện: liệt kê trong `requirements.txt` (ví dụ: Flask, pandas, scikit-learn, annoy, rapidfuzz, numpy)

Cài đặt phụ thuộc:

```powershell
pip install -r requirements.txt
```

## Cấu trúc dữ liệu

- File dữ liệu chính: `data/data.csv` (đường dẫn được cấu hình trong `backend/app.py` bằng biến `DATA_PATH`).
- Các cột feature numeric được sử dụng để dựng vector: `danceability`, `energy`, `valence`, `tempo`, `loudness` (được cấu hình trong `FEATURE_COLS`).

Ứng dụng sẽ loại bỏ các hàng thiếu các cột quan trọng (`name`, `artists`, `popularity` và các feature).

## Chạy ứng dụng

Khởi chạy server (mặc định host 0.0.0.0, port 5000):

```powershell
python backend/app.py
```

Khi chạy, ứng dụng sẽ:

- Tải `data/data.csv` vào pandas DataFrame.
- Chuẩn hoá các feature numeric bằng `StandardScaler`.
- Xây dựng Annoy index để phục vụ truy vấn gợi ý (ANN).

## API

1. GET /top

- Mô tả: trả về danh sách bài hát được sắp theo `popularity` giảm dần.
- Tham số:
  - `n` (int, tuỳ chọn, mặc định 20): số lượng bài trả về.
- Trả về: JSON với key `results` là mảng object có trường `id`, `name`, `artists`, `release_date`, `popularity`.

Ví dụ:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/top?n=10"
```

2. GET /search

- Mô tả: tìm kiếm theo tên bài hát (fuzzy search) sử dụng `rapidfuzz`.
- Tham số:
  - `q` (string, bắt buộc): từ khoá tìm kiếm.
- Trả về: JSON với `results` là danh sách bài khớp (fields: `id`, `name`, `artists`, `release_date`, `popularity`).

Ví dụ:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/search?q=bad+guy"
```

3. GET /recommend

- Mô tả: gợi ý bài hát tương tự dựa trên vector features và Annoy.
- Tham số (1 trong 2):
  - `id` (string): id của bài hát trong dataset — hoặc —
  - `name` (string): tên bài để fuzzy-match lên dataset.
- Trả về: JSON gồm `source` (tên bài nguồn) và `recommendations` là mảng các bài tương đồng (fields: `id`, `name`, `artists`, `release_date`, `popularity`, `similarity`).

Ví dụ (bằng tên):

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/recommend?name=Blinding+Lights"
```

Ví dụ (bằng id):

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/recommend?id=some_track_id"
```

## Thông số quan trọng (từ mã nguồn)

- `DATA_PATH = "data/data.csv"`
- `FEATURE_COLS = ['danceability', 'energy', 'valence', 'tempo', 'loudness']`
- `TOP_N_SEARCH = 50` (số lượng candidate fuzzy search tối đa trước khi lọc theo score)
- `TOP_N_RECOMMEND = 10` (số bài khuyến nghị trả về)

Ghi chú: fuzzy matching sử dụng ngưỡng score >= 60 để coi là khớp; Annoy được build với 50 trees.

## Lưu ý và mở rộng

- Dataset: tuỳ dữ liệu trong `data/data.csv`, bạn có thể muốn thêm các trường (ví dụ: URL, album, duration_ms) vào kết quả.
- Tối ưu: với dataset lớn, nên lưu trữ Annoy index ra file và load lại thay vì build mỗi lần khởi động.
- Sản xuất: tắt `debug=True` khi deploy và cân nhắc đặt reverse-proxy (nginx) hoặc dùng gunicorn/uvicorn container.

---

Tài liệu được sinh tự động từ nội dung của `backend/app.py` — nếu bạn muốn bổ sung thông tin (ví dụ: schema chính xác của `data/data.csv`), hãy cung cấp file hoặc mô tả thêm.
