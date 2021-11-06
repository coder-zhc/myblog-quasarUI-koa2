const { exec, escape } = require('../db/mysql')
const xss = require('xss')
// 获取博客列表
const getList = async (author, keyword, formanage, page, num) => {
  let sql = ``
  if (!formanage) {
    sql += `select  id, imgurl,title, destext, createtime, watch,  comment  from blogs where state=1 `
  } else {
    sql += `select id, title, createtime from blogs where state=1 `
  }
  if (author) {
    sql += `and author='${author}'`
  }
  if (keyword) {
    sql += `and title like '%${keyword}%'`
  }

  sql += `order by createtime desc  limit ${page} , ${num}`

  // 返回 promise
  return await exec(sql)
}

const getDraft = async (author,  keyword) => {
  let sql = `select id , title , createtime from blogs where state=0 and author = '${author}' `
  if (keyword) {
    sql += ` and title like '%${keyword}%' `
  }

  return await exec(sql)
}

// 获取文章数量 信息
const getCount = async (username, year) => {
  let sql = `select count(*) as counter from blogs where state=1 `
  if (username) {
    sql += `and author='${username}' `
  }
  if (year) {
    sql += `and year = ${year}`
  }
  const rows = await exec(sql)
  return rows[0]
}

// 获取归档信息
const getArchiveBasic = async () => {
  let sql = `select year, count(year) as counter from blogs where state = 1  group by year order by year desc ;`
  const rows = await exec(sql)
  return rows
}

const getArchiveFull = async (page, year) => {
  let sql = `select year, id, title,imgurl, createtime from blogs where state = 1 `
  if (year) {
    sql += `and year = ${year} `
  }
  sql += `order by year desc limit ${page} ,10;`
  const rows = await exec(sql)
  return rows
}

// 按分类名查找
const getBlogByCatagory = async (cname, page) => {
  let sql = `select id, title, imgurl, createtime, year from blogs where state = 1 `
  if (cname) {
    sql += `and catagory like '%${cname}%' `
  }
  sql += `order by createtime desc limit ${page} ,10;`
  const rows = await exec(sql)
  return rows
}



// 获取分类信息
const getCatagory = async () => {
  let sql = `select * from catagories;`
  const rows = await exec(sql)

  const sqlStr = (sortname) => {
    return `select count(catagory) as count from blogs where state = 1 and catagory like '%${sortname}%';`
  }

  for (let i = 0; i < rows.length; i++) {
    const counter = await exec(sqlStr(rows[i].sort_name))
    rows[i].count = counter[0].count
  }

  return rows
}

// 添加分类
const newCatagory = async (newcty, author) => {
  const sort_name = escape(newcty)
  const createtime = Date.now()
  const sql = `insert into catagories (sort_name, createtime, author) values (${sort_name}, ${createtime}, '${author}')`

  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

// 删除分类
const delCatagory = async (id, sort_name, author) => {
  const sql = `delete from catagories where id=${id}`
  // 删除相关博客中的该分类 
  // 查找到有该类名的博客 并修改
  let sql_blog = `select id, catagory from blogs where author='${author}' and catagory like '%${sort_name}%' `
  const rows = await exec(sql_blog)

  for (let i = 0; i < rows.length; i++) {
    let str = rows[i].catagory
    str = str.replace(sort_name, '')
    const sql_cur = `update blogs set catagory = '${str}' where id = ${rows[i].id}`
    const updateData = await exec(sql_cur)

    if (updateData.affectedRows > 0) {
      continue
    } else {
      return false
    }
  }

  const deleteData = await exec(sql)
  if (deleteData.affectedRows > 0) {
    return true
  }
  return false
}

// 修改分类信息
const updateCatagory = async (id, sort_name, new_name, author) => {
  const sql = `update catagories set sort_name = '${new_name}' where id=${id}`
  // 修改相关博客中的该分类 信息
  let sql_blog = `select id, catagory from blogs where catagory like '%${sort_name}%' and author='${author}' `
  const rows = await exec(sql_blog)

  for (let i = 0; i < rows.length; i++) {
    let str = rows[i].catagory
    str = str.replace(sort_name, new_name)

    const sql_cur = `update blogs set catagory = '${str}' where id = ${rows[i].id}`
    const updateData = await exec(sql_cur)

    if (updateData.affectedRows > 0) {
      continue
    } else {
      return false
    }
  }

  const deleteData = await exec(sql)
  if (deleteData.affectedRows > 0) {
    return true
  }
  return false
}


// 获取博客详情
const getDetail = async (id) => {
  const sql = `select * from blogs where id=${id}`
  const rows = await exec(sql)
  return rows[0]
}

// 新建博客
const newBlog = async (blogData = {}) => {
  // blogdata 是一个博客对象， 包含title content author createtime 属性
  const title = escape(xss(blogData.title))
  const content = escape(blogData.content)
  const author = escape(blogData.author)
  const imgurl = escape(blogData.imgurl)
  const year = escape(blogData.year)
  const destext = escape(blogData.destext)
  const catagory = escape(blogData.catagory)
  const createtime = Date.now()

  const sql = `insert into blogs (title, content, destext,catagory, createtime, author, imgurl, year) values(${title}, ${content}, ${destext}, ${catagory},  ${createtime}, ${author}, ${imgurl}, ${year})`

  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

// 更新博客
const updataBlog = async (id, blogData = {}) => {
  // 更新博客需要将 title 或 content 和createtime更新
  const title = escape(xss(blogData.title))
  const content = escape(blogData.content)
  const imgurl = escape(blogData.imgurl)
  const destext = escape(blogData.destext)
  const catagory = escape(blogData.catagory)
  const updatetime = Date.now()
  const sql = `update blogs set title=${title}, content=${content}, destext=${destext}, updatetime=${updatetime}, imgurl=${imgurl}, catagory=${catagory} , state=1 where id=${id}`

  const updateData = await exec(sql)
  if (updateData.affectedRows > 0) {
    return true
  }
  return false
}

// 删除博客
const delBlog = async (id, author) => {
  const sql = `delete from blogs where  id=${id} and author='${author}'`

  const deleteData = await exec(sql)
  if (deleteData.affectedRows > 0) {
    return true
  }
  return false
}

// 软删除博客
const softDelBlog = async (id, author) => {
  const sql = `update  blogs set state=0 where id='${id}' and author='${author}'`

  const deleteData = await exec(sql)
  if (deleteData.affectedRows > 0) {
    return true
  }
  return false
}
// ----------------------------------------------------------------------------
// 博客评论相关
// 添加评论
const newCommont = async (commentData) => {
  const nickname = escape(xss(commentData.nickname))
  const content = escape(commentData.content)
  const blog_id = commentData.blog_id
  const parent_id = commentData.parent_id || -1
  const parent_name = escape(xss(commentData.parent_name))  || null
  const createtime = Date.now()

  const sql = `insert into comment(nickname, createtime, content, blog_id, parent_id, parent_name) values (${nickname}, ${createtime}, ${content}, ${blog_id}, ${parent_id}, ${parent_name}) `
  const insertData = await exec(sql)

  return {
    id: insertData.insertId
  }
}


// 获取评论列表
const getCommentList = async (blog_id) => {
  const sql = `select id, nickname, createtime, content, blog_id, parent_id, parent_name from comment where blog_id=${blog_id}  order by createtime desc`
// 查找出一篇博客的全部评论
  const rows = await exec(sql)
  let parentArr = rows.filter(row => {
    return row.parent_id === -1
  })
  let childArr = rows.filter(row => {
    return row.parent_id !== -1
  })

  for(let i = 0; i < parentArr.length; i++) {
    parentArr[i].child = childArr.filter(item => {
      return item.parent_id === parentArr[i].id
    })
  }

  return parentArr
}





module.exports = {
  getList,
  getDraft,
  getCount,
  getArchiveBasic, getArchiveFull,
  getBlogByCatagory,
  getCatagory,
  delCatagory, updateCatagory, newCatagory,
  getDetail,
  newBlog,
  updataBlog,
  delBlog,
  softDelBlog,
  newCommont,
  getCommentList, 
}