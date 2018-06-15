// Setup basic express server
const { addMessage, getValue, getLength } = require('./src/queue')
const consola = require('consola')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3001

server.listen(port, () => {
  consola.start(`Server started at port ${port}`)
})

var numUsers = 0

io.on('connection', (socket) => {
  let addedUser = false
  socket.on('fetchHistory', () => {
    socket.emit('getHistoryMessage', getValue())
    consola.info(`${socket.username} wants to fetch history messages, the queue length is ${getLength()}`)
  })
  socket.on('newMessage', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('newMessage', {
      username: data.username,
      content: data.content,
      email: socket.email
    })
    addMessage(data)
    consola.info(`${data.username} said: ${data.content}`)
  })

  // when the client emits 'add user', this listens and executes
  socket.on('addUser', (username, email) => {
    if (addedUser) return

    // we store the username in the socket session for this client
    socket.username = username
    socket.email = email
    ++numUsers
    addedUser = true
    socket.emit('login', {
      numUsers: numUsers
    })
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('userJoined', {
      username: socket.username,
      email: socket.email,
      numUsers: numUsers
    })
    consola.info(`${socket.username} joined chat`)
  })

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username,
      email: socket.email
    })
  })

  // when the client emits 'stopTyping', we broadcast it to others
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', {
      username: socket.username,
      email: socket.email
    })
  })

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers

      // echo globally that this client has left
      socket.broadcast.emit('userLeft', {
        username: socket.username,
        email: socket.email,
        numUsers: numUsers
      })
      consola.info(`${socket.username} left`)
    }
  })
})
