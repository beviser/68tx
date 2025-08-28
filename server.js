const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Hàm tính MD5
function calculateMD5(phien, xuc_xac_1, xuc_xac_2, xuc_xac_3, tong, ket_qua) {
  const str = `${phien}${xuc_xac_1}${xuc_xac_2}${xuc_xac_3}${tong}${ket_qua}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

// Hàm lấy dữ liệu từ trang web (giả lập)
async function getTaiXiuData() {
  try {
    // Giả lập dữ liệu với các giá trị ngẫu nhiên
    const xuc_xac_1 = Math.floor(Math.random() * 6) + 1;
    const xuc_xac_2 = Math.floor(Math.random() * 6) + 1;
    const xuc_xac_3 = Math.floor(Math.random() * 6) + 1;
    const tong = xuc_xac_1 + xuc_xac_2 + xuc_xac_3;
    const ket_qua = tong >= 11 ? "Tài" : "Xỉu";
    
    return {
      Phien: Date.now(),
      Xuc_xac_1: xuc_xac_1,
      Xuc_xac_2: xuc_xac_2,
      Xuc_xac_3: xuc_xac_3,
      Tong: tong,
      Ket_qua: ket_qua
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    return null;
  }
}

// Route chính
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Lịch sử Tài Xỉu',
    endpoints: {
      history: '/myapi/taixiu/history',
      latest: '/myapi/taixiu/latest'
    }
  });
});

// API lấy lịch sử
app.get('/myapi/taixiu/history', async (req, res) => {
  try {
    const data = await getTaiXiuData();
    
    if (!data) {
      return res.status(500).json({ error: 'Không thể lấy dữ liệu' });
    }
    
    // Tính toán MD5
    data.Md5 = calculateMD5(
      data.Phien,
      data.Xuc_xac_1,
      data.Xuc_xac_2,
      data.Xuc_xac_3,
      data.Tong,
      data.Ket_qua
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu' });
  }
});

// API lấy kết quả mới nhất
app.get('/myapi/taixiu/latest', async (req, res) => {
  try {
    const data = await getTaiXiuData();
    
    if (!data) {
      return res.status(500).json({ error: 'Không thể lấy dữ liệu' });
    }
    
    // Tính toán MD5
    data.Md5 = calculateMD5(
      data.Phien,
      data.Xuc_xac_1,
      data.Xuc_xac_2,
      data.Xuc_xac_3,
      data.Tong,
      data.Ket_qua
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu' });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
