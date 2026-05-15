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

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS book_category (
      id VARCHAR(191) NOT NULL DEFAULT (uuid()),
      type VARCHAR(50) NOT NULL COMMENT '类型: college, major, grade',
      name VARCHAR(100) NOT NULL COMMENT '名称',
      sort INT DEFAULT 0 COMMENT '排序',
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      INDEX book_category_type_idx(type)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `;

  connection.query(createTableSQL, (err, results) => {
    if (err) {
      console.error('创建表失败:', err);
    } else {
      console.log('书籍分类表创建成功');

      const insertSQL = `
        INSERT IGNORE INTO book_category (id, type, name, sort) VALUES
        ('college-1', 'college', '人工智能学院', 1),
        ('college-2', 'college', '信息工程学院', 2),
        ('college-3', 'college', '机电工程学院', 3),
        ('college-4', 'college', '经济与管理学院', 4),
        ('college-5', 'college', '艺术与传媒学院', 5),
        ('major-1', 'major', '计算机科学与技术', 1),
        ('major-2', 'major', '软件工程', 2),
        ('major-3', 'major', '人工智能', 3),
        ('major-4', 'major', '大数据技术', 4),
        ('major-5', 'major', '网络工程', 5),
        ('major-6', 'major', '物联网工程', 6),
        ('major-7', 'major', '电子信息工程', 7),
        ('major-8', 'major', '机械设计制造', 8),
        ('grade-1', 'grade', '大一', 1),
        ('grade-2', 'grade', '大二', 2),
        ('grade-3', 'grade', '大三', 3),
        ('grade-4', 'grade', '大四', 4)
      `;

      connection.query(insertSQL, (err, results) => {
        if (err) {
          console.error('插入初始数据失败:', err);
        } else {
          console.log('初始数据插入成功');
        }
        connection.end();
      });
    }
  });
});