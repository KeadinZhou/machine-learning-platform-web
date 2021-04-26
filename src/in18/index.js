const in18_data = {
  USER_LOGIN: {
    zh: '用户登录',
    en: 'User Login'
  },
  LOGIN: {
    zh: '登录',
    en: 'Login'
  },
  USERNAME: {
    zh: '用户名',
    en: 'Username'
  },
  PASSWORD: {
    zh: '密码',
    en: 'Password'
  },
  CAPTCHA: {
    zh: '验证码',
    en: 'Captcha'
  },
  CAPTCHA_CLICK_TO_CHANGE: {
    zh: '看不清?点击更换图片',
    en: 'Click to Change Image'
  },
  CLICK_TO_REGISTER: {
    zh: '还没账号? 点此注册',
    en: 'No Account Yet? Click Here to Register'
  },
  USER_REGISTER: {
    zh: '用户注册',
    en: 'User Register'
  },
  REGISTER: {
    zh: '注册',
    en: 'Register'
  },
  CLICK_TO_LOGIN: {
    zh: '已有账号? 点此登录',
    en: 'Already Have an Account? Click Here to Login'
  },
  INVITATION_CODE: {
    zh: '邀请码',
    en: 'Invitation Code'
  },
  CONFIRM_PASSWORD: {
    zh: '再次确认密码',
    en: 'Confirm Password'
  },
  ENTERED_PASSWORDS_DIFFER: {
    zh: '两次密码不一致',
    en: 'Entered Passwords Differ'
  },
  ORGANIZATION: {
    zh: '组织名称',
    en: 'Organization'
  }
}

const in18 = {
  getIn18Config: function (key) {
    let result = {}
    for (let name in in18_data) {
      result[name] = in18_data[name][key]
    }
    return result
  }
}

export default in18;
