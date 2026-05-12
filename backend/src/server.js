require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 后端服务运行在 http://localhost:${PORT}`);
});