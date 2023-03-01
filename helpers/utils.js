const fs = require('fs')
const path = require('path')

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

async function sleep(ms) {
  if (ms === 'step') {
    ms = [1000, 2000, 3000][getRandomInt(3)]
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function sleepWithReturnFlg(ms) {
  await sleep(ms)
  return { sleepFlag: true }
}

function chunks(arr, size) {
  const max = arr.length
  const newArr = []
  let i = 0
  while (i < max) {
    const chunk = []
    for (let j = 0; j < size && i < max; j++, i++) {
      chunk.push(arr[i])
    }
    newArr.push(chunk)
  }
  return newArr
}

function getTimeNow() {
  return parseInt(Date.now() / 1000)
}

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/\-/g, '').replace(/\_/g, '').trim()
}


module.exports = {
  sleep,
  sleepWithReturnFlg,
  chunks,
  getTimeNow,
  normalizeText,
}
