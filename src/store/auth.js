import axios from 'axios'
import router from '../router/index'

export default {
  state: {
    userLogin: [],
    token: localStorage.getItem('token') || null
  },
  mutations: {
    setUser(state, payload) {
      state.userLogin = payload
      state.token = payload.token
    },
    delUser(state) {
      state.userLogin = {}
      state.token = null
    }
  },
  actions: {
    register(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .post('http://127.0.0.1:5000/user/register', payload)
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err.response.data.msg)
          })
      })
    },
    login(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .post('http://127.0.0.1:5000/user/login', payload)
          .then(res => {
            context.commit('setUser', res.data.data)
            localStorage.setItem('token', res.data.data.token)
            resolve(res.data)
          })
          .catch(err => {
            reject(err.response.data.msg)
          })
      })
    },
    interceptorRequest(context) {
      console.log('interceptors works!')
      axios.interceptors.request.use(
        function(config) {
          config.headers.authorization = `Bearer ${context.state.token}`
          // Do something before request is sent
          return config
        },
        function(error) {
          return Promise.reject(error)
        }
      )
    },
    logout(context) {
      localStorage.removeItem('token')
      context.commit('delUser')
      router.push('/')
    },
    interceptorResponse(context) {
      axios.interceptors.response.use(
        function(response) {
          return response
        },
        function(error) {
          if (error.response.status === 403) {
            if (
              error.response.data.msg === 'invalid token' ||
              error.response.data.msg === 'invalid signature!'
            ) {
              localStorage.removeItem('token')
              context.commit('delUser')
              router.push('/login')
              alert('Sorry your token is invalid! cannot pass this section!')
            } else if (error.response.data.msg === 'jwt expired') {
              localStorage.removeItem('token')
              context.commit('delUser')
              router.push('/login')
              alert('Sorry your token is invalid! cannot pass this section!')
            }
          }
          return Promise.reject(error)
        }
      )
    },
    resetPassword(context, payload) {
      console.log(payload)
      return new Promise((resolve, reject) => {
        axios
          .post('http://127.0.0.1:5000/user/forgot', payload)
          .then(res => {
            console.log(res.data.msg)
            resolve(res.data.msg)
          })
          .catch(err => {
            reject(err.response.data.msg)
          })
      })
    },
    newPassword(context, payload) {
      return new Promise((resolve, reject) => {
        axios
          .patch('http://127.0.0.1:5000/user/reset', payload)
          .then(res => {
            resolve(res.data.msg)
          })
          .catch(err => {
            resolve(err.response.data.msg)
          })
      })
    },
    setPin(context, payload) {
      console.log(payload)
      return new Promise((resolve, reject) => {
        axios
          .patch(`http://127.0.0.1:5000/pin/${payload.id}`, payload.form)
          .then(res => {
            console.log(res)
            resolve(res.data.msg)
          })
          .catch(err => {
            resolve(err.response.data.msg)
          })
      })
    }
  },
  getters: {
    user(state) {
      return state.userLogin
    },
    isLogin(state) {
      return state.token !== null
    }
  }
}
