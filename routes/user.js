const router = require('koa-router')()
const {login, getUserInfo, updateUserInfo} = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

router.prefix('/api/user') // 前缀

router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  const data = await login(username, password)
  if (data.username) {
    // 将登录信息 用户名密码 写入session里面
    ctx.session.username = data.username
    ctx.session.realname = data.realname
    ctx.body = new SuccessModel({
      username: data.username,
      realname: data.realname,
    })
    return
  }
  ctx.body = new ErrorModel('登录失败')
})

// 登录验证
router.get('/islogin', async (ctx) => {
  if(ctx.session.username) {
    ctx.body = new SuccessModel({
      username: ctx.session.username,
      realname: ctx.session.realname
    })
    return 
  }
  ctx.body = new ErrorModel('未登录')
})

// 获取用户信息
router.get('/userinfo',loginCheck, async (ctx) => {
  const userIfo = await getUserInfo(ctx.query.username)
  ctx.body = new SuccessModel(userIfo)
})

// 修改用户信息
router.post('/change-info',loginCheck, async (ctx) => {
  const oldname = ctx.session.username
  const oldrealname = ctx.session.realname
  const data = await updateUserInfo({oldname, oldrealname, ...ctx.request.body})
  ctx.body = new SuccessModel(data)
})


// 注销登录
router.get('/logout' ,async (ctx) => {
  // 退出登录， 清除session ，浏览器也会清除cookie
  ctx.session = null
  ctx.body = new SuccessModel()
})

module.exports = router
