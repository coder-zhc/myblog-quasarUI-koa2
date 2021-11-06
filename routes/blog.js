const router = require('koa-router')()
const {
  getList,
  getDraft,
  getDetail,
  getArchiveBasic,
  getArchiveFull,
  newCatagory,
  getBlogByCatagory,
  getCatagory,
  updateCatagory,
  delCatagory,
  getCount,
  newBlog,
  updataBlog,
  delBlog,
  softDelBlog,
  newCommont,
  getCommentList,
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')
const path = require('path')
const upload = require('../middleware/uploadImg')

router.prefix('/api/blog') // 前缀

// 上传图片
router.post('/upload-img', upload.single('file'), async (ctx, next) => {

  ctx.body = new SuccessModel({
    imgUrl: path.join(__dirname, '../public/') + ctx.file.originalname
  })
})

router.get('/list', async (ctx) => {
  let author = ctx.session.username
  const keyword = ctx.query.keyword || ''
  const formanage = ctx.query.manage || false
  const page = ctx.query.page || 1
  const num = ctx.query.num || 10

  if (ctx.query.isadmin) {
    console.log('is admin')
    // 管理员界面
    if (ctx.session.username == null) {
      console.error('is admin but not login')
      // 未登录
      ctx.body = new ErrorModel('未登录')
      return
    }
    // 强制查询自己的博客
    author = ctx.session.username
  }

  const listData = await getList(author, keyword, formanage, (page - 1) * 10, num)
  if (listData.length !== 0) {
    ctx.body = new SuccessModel(listData)
  } else {
    console.log('no more');
    ctx.body = new ErrorModel("没有更多了")
  }
})

router.get('/draft', async (ctx) => {
  let author = ctx.session.username
  const keyword = ctx.query.keyword || ''

  const listData = await getDraft(author, keyword)
  ctx.body = new SuccessModel(listData)

})

router.get('/count', async (ctx, next) => {
  const year = ctx.query.year || null
  const count = await getCount(ctx.session.username, year)

  ctx.body = new SuccessModel(count)
})

router.get('/archive-basic', async (ctx, next) => {
  const data = await getArchiveBasic()
  ctx.body = new SuccessModel(data)
})

router.get('/archive-full', async (ctx, next) => {
  const page = ctx.query.page || 1
  const year = ctx.query.year || 0
  const data = await getArchiveFull((page - 1) * 10, year)
  ctx.body = new SuccessModel(data)

})

router.get('/catagory', async (ctx, next) => {
  const data = await getCatagory()
  ctx.body = new SuccessModel(data)
})

router.get('/catagory-blog', async (ctx, next) => {
  const page = ctx.query.page || 1
  const catagory = ctx.query.catagory || 0
  const data = await getBlogByCatagory(catagory, (page - 1) * 10)
  ctx.body = new SuccessModel(data)
})


router.get('/detail', async (ctx, next) => {
  let blogDetail = await getDetail(ctx.query.id)
  ctx.body = new SuccessModel(blogDetail)
})

router.get('/edit', async (ctx, next) => {
  let blogDetail = await getDetail(ctx.query.id)
  ctx.body = new SuccessModel(blogDetail)
})

router.post('/new', loginCheck, async (ctx, next) => {
  const body = ctx.request.body

  body.author = ctx.session.username
  const data = await newBlog(body)
  ctx.body = new SuccessModel(data)
})

router.post('/update', loginCheck, async (ctx, next) => {
  const val = await updataBlog(ctx.query.id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('更新博客失败')
  }
})


router.post('/del', loginCheck, async (ctx, next) => {
  const author = ctx.session.username

  const val = await delBlog(ctx.query.id, author)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('删除博客失败')
  }
})


// 添加新的分类
router.post('/new-catagory', loginCheck, async (ctx) => {
  const name = ctx.query.name.trim()
  const author = ctx.session.username

  const data = await newCatagory(name, author)
  ctx.body = new SuccessModel(data)
})

// 修改分类信息
router.post('/update-catagory', loginCheck, async (ctx, next) => {
  const author = ctx.session.username
  const new_name = ctx.query.new_name.trim()
  const origin_name = ctx.query.origin_name


  const val = await updateCatagory(ctx.query.id, origin_name, new_name, author)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('更新分类失败')
  }
})


// 删除分类
router.post('/del-catagory', loginCheck, async (ctx) => {
  const author = ctx.session.username

  const val = await delCatagory(ctx.query.id, ctx.query.name, author)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('删除分类失败')
  }
})

router.post('/softdel', loginCheck, async (ctx, next) => {
  const author = ctx.session.username

  const val = await softDelBlog(ctx.query.id, author)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('删除失败')
  }
})


router.get('/comment', async (ctx) => {
  const commentData = await getCommentList(ctx.query.blog_id)

  if (commentData.length > 0) {
    ctx.body = new SuccessModel(commentData)
  } else {
    ctx.body = new ErrorModel()
  }
})

router.post('/new-comment', async (ctx) => {

  // ctx.body = new SuccessModel(ctx.request.body)
  const insertData = await newCommont(ctx.request.body)
  ctx.body = new SuccessModel(insertData)
})

module.exports = router