const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'campus_trading'
});

connection.connect((err) => {
  if (err) {
    console.error('连接失败:', err);
    process.exit(1);
  }
  
  const columns = ['college', 'major', 'bookName', 'grade'];
  let completed = 0;
  
  columns.forEach(col => {
    connection.query(`ALTER TABLE goods ADD COLUMN ${col} VARCHAR(191) NULL;`, (err, results) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error(`添加 ${col} 字段失败:`, err);
      } else {
        console.log(`${col} 字段添加成功`);
      }
      
      completed++;
      if (completed === columns.length) {
        connection.end();
        console.log('所有字段添加完成');
      }
    });
  });
});