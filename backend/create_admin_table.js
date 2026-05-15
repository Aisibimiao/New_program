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

  const sqls = [
    `CREATE TABLE IF NOT EXISTS Admin (
      id VARCHAR(191) NOT NULL DEFAULT (uuid()),
      userId VARCHAR(191) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
      permissions JSON,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE INDEX Admin_userId_key(userId)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `ALTER TABLE Admin ADD CONSTRAINT Admin_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE`
  ];

  let completed = 0;
  sqls.forEach(sql => {
    connection.query(sql, (err, results) => {
      if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.error('SQL执行失败:', err.message);
      } else {
        console.log('SQL执行成功');
      }
      completed++;
      if (completed === sqls.length) {
        connection.end();
        console.log('管理员表创建完成');
      }
    });
  });
});