const multer = require('@koa/multer');
const path = require('path')

const storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'))
  },
  //修改文件名称
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

//文件上传限制
const limits = {
  fields: 10,//非文件字段的数量
  fileSize: 2 * 1024 * 1024,//文件大小 单位 b
  files: 1//文件数量
}

const upload = multer({
  storage,
  limits
});

module.exports = upload