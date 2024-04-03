export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const chunks = (arr: any, size: number) => {
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
