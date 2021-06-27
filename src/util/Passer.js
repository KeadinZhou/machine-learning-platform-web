const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 16
const PASSWORD_NEED_UPPER = true
const PASSWORD_NEED_LOWER = true
const PASSWORD_NEED_ALPHABET = PASSWORD_NEED_UPPER || PASSWORD_NEED_LOWER || true
const PASSWORD_NEED_NUMBER = true
const PASSWORD_NEED_OTHER = false


const checkPasswordLength = function (password) {
  if (password.length < MIN_PASSWORD_LENGTH) return false
  if (password.length > MAX_PASSWORD_LENGTH) return false
  return true
}

const checkPasswordStrength = function (password) {
  let upperCnt = 0
  let lowerCnt = 0
  let numberCnt = 0
  let otherCnt = 0
  for (let x of password) {
    if (/[A-Z]/.test(x)) {
      upperCnt++
    } else if (/[a-z]/.test(x)) {
      lowerCnt++
    } else if (/[0-9]/.test(x)) {
      numberCnt++
    } else {
      otherCnt++
    }
  }

  if (PASSWORD_NEED_UPPER && upperCnt <= 0) return false
  if (PASSWORD_NEED_LOWER && lowerCnt <= 0) return false
  if (PASSWORD_NEED_ALPHABET && (lowerCnt+upperCnt) <= 0) return false
  if (PASSWORD_NEED_NUMBER && numberCnt <= 0) return false
  if (PASSWORD_NEED_OTHER && otherCnt <= 0) return false
  return true
}

const passer = {
  checkPasswordLength: checkPasswordLength,
  checkPasswordStrength: checkPasswordStrength,
}

export default passer;
