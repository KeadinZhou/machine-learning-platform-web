import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router'
import in18 from "@/in18";

Vue.use(Vuex)

const host = 'http://47.98.230.206:5002'

const ML_IN18_VALUE = 'ML_IN18_VALUE'

const defaultConfiguration = {
  "zh-image": 'login.jpg',
  "zh-title": 'SAFFI决策支持系统',
  "en-image": "",
  "en-title": "Visual Modeling Platform"
}

export default new Vuex.Store({
  state: {
    host,
    current_page: {},
    user: null,
    buildGetQuery: function (data) {
      let res = ''
      for (let item in data) {
        if (res) {
          res += '&'
        }
        res += `${item}=${encodeURIComponent(data[item])}`
      }
      if (res) {
        res = '?' + res
      }
      return res
    },
    crc32: function (str) {
      let table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
      let crc = 0
      let n = 0; //a number between 0 and 255
      let x = 0; //an hex number
      crc = crc ^ (-1);
      for( var i = 0, iTop = str.length; i < iTop; i++ ) {
        n = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
        x = "0x" + table.substr( n * 9, 8 );
        crc = ( crc >>> 8 ) ^ x;
      }
      return (Math.abs(crc ^ (-1))).toString(16);
    },
    nodeMap: new Map(),
    nodeType: new Map(),
    nodeExtra: new Map(),
    dataForFrame: {},
    in18Value: 'zh',
    in18Data: {},
    configuration: defaultConfiguration
  },
  mutations: {
    updateCurrentPage(state, data) {
      state.current_page = data
    },
    updateUserInfo(state, data) {
      state.user = data
    },
    updateUser(state, showMsg) {
      let that = this._vm
      that.$http.get(state.host + '/session')
        .then(data => {
          let Data = data.data
          state.user = Data
          if (showMsg) {
            that.$message.success('欢迎你, ' + Data.username)
            router.replace({name: 'project'})
          }
        })
        .catch((error) => {
          router.replace({name: 'login'})
          if (showMsg) {
            if (error.response) {
              if (error.response.status === 401) {
                that.$message.error('请先登录')
              } else {
                that.$message.error(error.response.data.message)
              }
            } else {
              that.$message.error('请求失败')
            }
          }
        })
        .finally(() => {
        })
    },
    login(state, user) {
      let that = this._vm
      let sendData = new FormData()
      sendData.append('username', user.username)
      sendData.append('password', user.password)
      sendData.append('captcha', user.captcha)
      that.$http.post(state.host + '/session', sendData)
        .then(() => {
          this.commit('updateUser', true)
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    logout(state) {
      let that = this._vm
      that.$http.delete(state.host + '/session')
        .then(() => {
          that.$message.success('登出成功')
          state.user = null
          router.replace({name:'login'})
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('登出失败')
          }
        })
        .finally(() => {
        })
    },
    saveNodeData(state, data) {
      if (typeof data.id !== "string") {
        data.id = String(data.id)
      }
      state.nodeMap.set(data.id, data)
      state.nodeExtra.set(data.id, data.extra)
    },
    saveNodeType(state, data) {
      state.nodeType.set(data.type, data)
    },
    saveNodeExtra(state, data) {
      if (typeof data.id !== "string") {
        data.id = String(data.id)
      }
      let old = state.nodeExtra.get(String(data.id))
      if (!old) {
        old = {}
      }
      for (let item in data.extra) {
        old[item] = data.extra[item]
      }
      state.nodeExtra.set(data.id, old)
      let that = this._vm
      let sendData = new FormData()
      sendData.append('extra', JSON.stringify(old))
      that.$http.put(state.host + `/node/${data.id}`, sendData)
        .then(() => {
          if (data.showMsg) {
            that.$message.success('保存成功')
          }
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    deleteNodeInServer(state, node_id) {
      let that = this._vm
      that.$http.delete(state.host + `/node/${node_id}`)
        .then(() => {
          that.$message.success('删除成功')
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    deleteEdgeInServer(state, data) {
      let that = this._vm
      that.$http.delete(state.host + `/node/edge` + state.buildGetQuery(data))
        .then(() => {
          that.$message.success('删除成功')
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    newEdgeInServer(state, data) {
      let that = this._vm
      let sendData = new FormData()
      sendData.append('project_id', data.project_id)
      sendData.append('node1_id ', data.node1_id )
      sendData.append('node2_id ', data.node2_id )
      that.$http.post(state.host + `/node/edge` + state.buildGetQuery(data))
        .then(() => {
          // that.$message.success('连接成功')
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    buildDataForFrame(state, data) {
      if (data === undefined || data === null) {
        state.dataForFrame = {}
      } else {
        let dataForFrame = {
          name: '',
          nodeList: [],
          lineList: []
        }
        for (let item of data) {
          dataForFrame.nodeList.push({
            id: String(item.id),
            name: state.nodeType.get(item.node_type).name,
            type: item.node_type,
            left: item.extra.x + 'px',
            top: item.extra.y + 'px',
            ico: state.nodeType.get(item.node_type).icon ? state.nodeType.get(item.node_type).icon : 'el-icon-question',
          })
          for (let outer of item.out_edges) {
            dataForFrame.lineList.push({
              from: String(item.id),
              to: String(outer)
            })
          }
        }
        state.dataForFrame = dataForFrame
      }
    },
    updateConfiguration(state) {
      let that = this._vm
      let self = this
      let value = localStorage.getItem(ML_IN18_VALUE)
      value = value?value:'zh'
      state.in18Value = value
      that.$http.get(state.host + `/configuration`)
        .then(data => {
          state.configuration = {}
          let Data = data.data.data
          for (let item of Data) {
            state.configuration[item.key] = item.value
          }
          self.commit('updateDocumentTitle', state.configuration[`${value}-title`])
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(() => {
        })
    },
    updateDocumentTitle(state, data) {
      document.title = data
    },
    loadIn18Config(state, data) {
      if (!data) {
        data = state.in18Value
      }
      this.commit('updateDocumentTitle', state.configuration[`${data}-title`])
      state.in18Data = in18.getIn18Config(data)
    },
    updateIn18Value(state, data) {
      localStorage.setItem(ML_IN18_VALUE, data)
      state.in18Value = data
      this.commit('loadIn18Config', data)
    }
  },
  actions: {
  },
  modules: {
  }
})
