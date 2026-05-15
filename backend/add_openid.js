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
  
  connection.query(`
    ALTER TABLE user ADD COLUMN openid VARCHAR(191) NULL;
  `, (err, results) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加字段失败:', err);
    } else {
      console.log('openid 字段添加成功');
    }
    
    connection.query(`
      ALTER TABLE user ADD UNIQUE INDEX user_openid_key(openid);
    `, (err, results) => {
      if (err && err.code !== 'ER_DUP_KEYNAME') {
        console.error('添加索引失败:', err);
      } else {
        console.log('openid 索引添加成功');
      }
      
      connection.end();
    });
  });
});