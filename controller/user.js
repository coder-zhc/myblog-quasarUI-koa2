const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const login = async (username, password) => {
  username = escape(username)
  // 加密
  password = genPassword(password)
  // 将密码的特殊字符转义
  password = escape(password)

  const sql = `
    select username, realname from users where username=${username} and password=${password}
  `

  const rows = await exec(sql)
  return rows[0] || {}
}

const getUserInfo = async (username) => {
  const sql = `select id,  username, realname, signature, email from users where username='${username}'`
  const rows = await exec(sql)
  return rows[0]
}

const updateUserInfo = async (userifo) => {
  const username = escape(userifo.username)
  const email = escape(userifo.email)
  const signature = escape(userifo.signature)
  const realname = escape(userifo.realname)
  let password = userifo.password
  const id = userifo.id

  let sql = `update users set `
  if (username !== userifo.oldname) {
    sql += `username = '${userifo.username}' `
  }

  if (realname !== userifo.oldrealname) {
    sql += ` ,realname = '${userifo.oldrealname}' `
  }
  sql += ` , signature = ${signature}, email = ${email} `
  if (password !== '') {
    password = genPassword(password)
    sql += `, password = '${password}' `
  }
  sql += `where id = ${id}`

  const updateData = await exec(sql)
  if (updateData.affectedRows <= 0) {
    return false
  }

  let sql_blog = `select id from blogs where author='${userifo.oldname}' `
  let sql_catagory = `select id from catagories where author='${userifo.oldname}' `
  const rows = await exec(sql_blog)
  const rowsCatagory = await exec(sql_catagory)
  for (let i = 0; i < rows.length; i++) {
    const sql_cur = `update blogs set author = ${username} where id = ${rows[i].id}`
    const updateData = await exec(sql_cur)

    if (updateData.affectedRows > 0) {
      continue
    } else {
      return false
    }
  }

  for (let i = 0; i < rowsCatagory.length; i++) {
    const sql_cur = `update catagories set author = ${username} where id = ${rowsCatagory[i].id}`
    const updateData = await exec(sql_cur)
    if (updateData.affectedRows > 0) {
      continue
    } else {
      return false
    }
  }

  return true
}

module.exports = { login, getUserInfo, updateUserInfo }