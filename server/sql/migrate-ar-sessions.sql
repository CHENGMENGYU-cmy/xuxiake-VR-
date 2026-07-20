-- AR 眼镜数据会话表
CREATE TABLE IF NOT EXISTS ar_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  device_model VARCHAR(100) NOT NULL,
  device_version VARCHAR(50),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  trajectory JSON COMMENT 'GPS轨迹数组 [{lat,lng,altitude,accuracy,heading,speed,timestamp}]',
  trajectory_point_count INT DEFAULT 0,
  sensor_summary JSON COMMENT '传感器摘要 {sampleRate,totalSamples,maxAccel,avgSpeed,deviceTemp}',
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  total_duration_minutes INT DEFAULT 0,
  media_count INT DEFAULT 0,
  post_id INT COMMENT '导入后关联的帖子ID',
  status ENUM('IMPORTING','READY','ERROR') DEFAULT 'IMPORTING',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);
