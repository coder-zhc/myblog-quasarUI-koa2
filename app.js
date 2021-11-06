const Koa = require('koa')
const app = new Koa()
const json = require('koa-json') 
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const { REDIS_CONF } = require('./conf/db')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')

const blog = require('./routes/blog')
const user = require('./routes/user')

onerror(app)

// 解析post data
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

// 格式化json，使得返回的json具有缩进，更漂亮
app.use(json())


// 开发环境用dev格式的日志打印控制台，线上用combined 格式写入日志文件
const ENV = process.env.NODE_ENV
if(ENV !== 'production') {
  app.use(logger())
  app.use(morgan('dev'))
} else {
  // 线上环境 
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(morgan('combined', {
    stream: writeStream
  }))
}

// session 配置
app.keys = ['qwaszx#123_']
app.use(session({
  // 配置cookie
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  // 配置redis
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))


// routes
app.use(blog.routes(), blog.allowedMethods())
app.use(user.routes(), user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
