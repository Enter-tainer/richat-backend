const maxLength = 1000 // Modify it if you like
let queue = [] // [0, maxLength)

exports.addMessage = (data) => {
  if (queue.length >= maxLength) queue.shift()
  queue.push(data)
}

exports.getValue = () => {
  return queue
}

exports.getLength = () => {
  return queue.length
}