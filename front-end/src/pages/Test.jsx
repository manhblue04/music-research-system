import React, { useEffect, useState } from "react";
import { Card } from "antd"; // Nếu bạn dùng Ant Design
import axios from "axios";

const Test = () => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Thay URL này bằng API thực tế của bạn
    const fetchSong = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/top");
        setSong(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!song) return <p>Không có dữ liệu bài hát.</p>;

  return (
    <Card
      title={song.name}
      style={{ width: 400, margin: "20px auto", textAlign: "center" }}
    >
      <p><strong>ID:</strong> {song.id}</p>
      <p><strong>Artists:</strong> {JSON.parse(song.artists).join(", ")}</p>
      <p><strong>Popularity:</strong> {song.popularity}</p>
      <p><strong>Release Date:</strong> {song.release_date}</p>
    </Card>
  );
};

export default Test;