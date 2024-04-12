import { nanoid } from 'nanoid'

export const AUTH_TOKEN_SIZE = 22
export function generateRandomToken(): string {
  const token = nanoid(AUTH_TOKEN_SIZE)
  // console.log(token)
  const tokenSerial = _groupStringByDashes(token.replace(/[_-]/g, ''))

  return tokenSerial
}

function _groupStringByDashes(input: string, groupEvery = 4): string {
  const separatedString = []
  let currentIndex = 0

  while (currentIndex < input.length) {
    separatedString.push(input.substring(currentIndex, Math.min(input.length, currentIndex + groupEvery)))
    currentIndex += groupEvery
  }

  return separatedString.join('-')
}
