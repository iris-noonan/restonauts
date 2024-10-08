const bcrypt = require('bcryptjs')

module.exports = [
  {
    username: 'admin',
    role: 'admin',
    password: bcrypt.hashSync('a', 10)
  },
  {
    username: 'Iris',
    role: 'user',
    password: bcrypt.hashSync('i', 10)
  },
  {
    username: 'Ada',
    role: 'user',
    password: bcrypt.hashSync('a', 10)
  },
]
