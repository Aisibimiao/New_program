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
  
  connection.query(`ALTER TABLE user MODIFY COLUMN password VARCHAR(191) NULL;`, (err, results) => {
    if (err) {
      console.error('修改字段失败:', err);
    } else {
      console.log('password 字段已改为可选');
    }
    
    connection.end();
  });
});