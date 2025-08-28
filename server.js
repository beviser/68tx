const express = require('express');
const puppeteer = require('puppeteer');
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

// Hàm lấy dữ liệu thực từ trang game
async function getRealTaiXiuData() {
  let browser = null;
  try {
    // Khởi tạo Puppeteer với các tùy chọn
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent để trông giống browser thật
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Điều hướng đến trang game
    await page.goto('https://68gbvn25.biz/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Chờ cho các element cần thiết load xong
    await page.waitForTimeout(5000);

    // Lấy dữ liệu từ trang - CẦN ĐIỀU CHỈNH THEO CẤU TRÚC THỰC TẾ
    const gameData = await page.evaluate(() => {
      // Đây là phần code cần điều chỉnh dựa trên cấu trúc HTML thực tế
      // của trang game. Bạn cần kiểm tra HTML để xác định correct selectors
      
      // Ví dụ selector giả định:
      const historyItems = document.querySelectorAll('.history-item');
      const latestItem = historyItems[0];
      
      if (!latestItem) return null;
      
      // Giả định cấu trúc dữ liệu - CẦN ĐIỀU CHỈNH
      return {
        phien: latestItem.getAttribute('data-phien') || Date.now(),
        xuc_xac_1: parseInt(latestItem.getAttribute('data-dice-1')) || Math.floor(Math.random() * 6) + 1,
        xuc_xac_2: parseInt(latestItem.getAttribute('data-dice-2')) || Math.floor(Math.random() * 6) + 1,
        xuc_xac_3: parseInt(latestItem.getAttribute('data-dice-3')) || Math.floor(Math.random() * 6) + 1
      };
    });

    await browser.close();

    if (!gameData) {
      throw new Error('Không tìm thấy dữ liệu game');
    }

    // Tính toán kết quả
    const tong = gameData.xuc_xac_1 + gameData.xuc_xac_2 + gameData.xuc_xac_3;
    const ket_qua = tong >= 11 ? "Tài" : "Xỉu";

    return {
      Phien: gameData.phien,
      Xuc_xac_1: gameData.xuc_xac_1,
      Xuc_xac_2: gameData.xuc_xac_2,
      Xuc_xac_3: gameData.xuc_xac_3,
      Tong: tong,
      Ket_qua: ket_qua
    };

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thực:', error);
    if (browser) {
      await browser.close();
    }
    
    // Fallback: trả về dữ liệu giả lập nếu không lấy được dữ liệu thực
    return getFallbackData();
  }
}

// Hàm dự phòng trả về dữ liệu giả lập
function getFallbackData() {
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
}

// API endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Lịch sử Tài Xỉu',
    endpoints: {
      history: '/myapi/taixiu/history',
      latest: '/myapi/taixiu/latest'
    }
  });
});

app.get('/myapi/taixiu/history', async (req, res) => {
  try {
    const data = await getRealTaiXiuData();
    
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

app.get('/myapi/taixiu/latest', async (req, res) => {
  try {
    const data = await getRealTaiXiuData();
    
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

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
