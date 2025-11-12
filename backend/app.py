from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from annoy import AnnoyIndex
from rapidfuzz import process, fuzz
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

# ==== Cấu hình ====
DATA_PATH = "data/data_with_image.csv"
FEATURE_COLS = ['danceability', 'energy', 'valence', 'tempo', 'loudness']
TOP_N_SEARCH = 50
TOP_N_RECOMMEND = 10

# ==== Khởi tạo Flask ====
app = Flask(__name__)
CORS(app)  

# ==== Đọc dữ liệu ====
print("Đang tải dữ liệu...")
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=FEATURE_COLS + ['name', 'artists', 'popularity'])
df.reset_index(drop=True, inplace=True)

# Chuẩn hóa feature numeric
scaler = StandardScaler()
X = scaler.fit_transform(df[FEATURE_COLS])

# Precompute cho search
names_list = df['name'].tolist()

# ==== Build ANN index cho recommend ====
vec_len = X.shape[1]
ann_index = AnnoyIndex(vec_len, 'angular')
for i, v in enumerate(X):
    ann_index.add_item(i, v.tolist())
ann_index.build(50)  # số cây trong Annoy

print(f"Đã tải {len(df)} bài hát, chuẩn bị xong ANN index.")

# ==== Lấy các bài hát nổi tiếng cho trang chủ ====
@app.route("/top")
def top_tracks():
    top_n = request.args.get("n", 20, type=int)  # mặc định 20 bài
    result = df.sort_values(by='popularity', ascending=False).head(top_n)
    return jsonify({
        "results": result[['id', 'name', 'artists','release_date', 'popularity','image']].to_dict(orient='records')
    })

# ==== Tìm kiếm theo tên (fuzzy search) ====
@app.route("/search")
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Thiếu tham số q"}), 400

    matches = process.extract(
        q, 
        names_list, 
        scorer=fuzz.WRatio, 
        limit=TOP_N_SEARCH
    )
    matched_names = [name for name, score, _ in matches if score >= 60]
    if not matched_names:
        return jsonify({"results": []})

    result = df[df['name'].isin(matched_names)]
    result = result.sort_values(by='popularity', ascending=False).head(20)

    return jsonify({
        "results": result[['id', 'name', 'artists','release_date', 'popularity','image']].to_dict(orient='records')
    })

# ==== Gợi ý bài hát tương tự ====
@app.route("/recommend")
def recommend():
    track_id = request.args.get("id")
    name_query = request.args.get("name", "").strip()

    if track_id:
        if track_id not in df['id'].values:
            return jsonify({"error": "ID không tồn tại"}), 404
        idx = df.index[df['id'] == track_id][0]
    elif name_query:
        best_match, score, _ = process.extractOne(name_query, names_list, scorer=fuzz.WRatio)
        if score < 60:
            return jsonify({"error": "Không tìm thấy bài hát tương tự"}), 404
        idx = df.index[df['name'] == best_match][0]
    else:
        return jsonify({"error": "Thiếu id hoặc name"}), 400

    # Lấy top N bài gần nhất từ ANN
    top_idx = ann_index.get_nns_by_item(idx, TOP_N_RECOMMEND + 1)
    top_idx = [i for i in top_idx if i != idx][:TOP_N_RECOMMEND]

    result = df.iloc[top_idx][['id', 'name', 'artists','release_date', 'popularity','image']].copy()

    # Tính cosine similarity chính xác giữa vector bài gốc và top kết quả
    song_vec = X[idx].reshape(1, -1)
    sims = cosine_similarity(X[top_idx], song_vec).flatten()
    result['similarity'] = sims

    return jsonify({
        "source": df.iloc[idx]['name'],
        "recommendations": result.sort_values(by='similarity', ascending=False).to_dict(orient='records')
    })


# ==== Run ====
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)