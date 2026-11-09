require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Endpoint Test (Kalau sukses dikunjungi, bakal munculin teks)
app.get('/', (req, res) => {
    res.send('Server Konveksi Jalan! 🚀');
});

// Contoh Endpoint untuk ambil data produk (Nanti bisa dipisah ke folder routes)
app.get('/api/products', async (req, res) => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server nyala di http://localhost:${PORT}`);
});