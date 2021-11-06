const env = process.env.NODE_ENV // 环境参数， 当我们在package.json 的script 中自己定义了NODE_ENV 那就会自动添加到process.env中

// 配置
let MYSQL_CONF
let REDIS_CONF

if(env === 'dev') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'qwaszx',
    port: '3306',
    database: 'myblog'
  }

  // redis
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
}

if(env === 'production') {
  // 由于在本地，上线需要更改
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'qwaszx',
    port: '3306',
    database: 'myblog'
  }

  // redis
  REDIS_CONF = {
    port: '6379',
    host: '127.0.0.1'
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}