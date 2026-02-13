import * as crypto from 'crypto'

export function randomIntegers(length: number = 6): string {
    let randInt = ''
    while (length > 0) {
      randInt += crypto.randomInt(10)
      length--
    }
  
    return randInt
}