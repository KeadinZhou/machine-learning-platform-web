<template>
  <div class="project-node-list-box">
    <loading-box-frame v-if="loading"></loading-box-frame>
    <div
        v-for="(item,index) in list"
        :key="index"
        class="project-node-list-item"
        :data-shape="item.shape"
        :data-type="item.type"
        :data-size="item.size"
        draggable
        @dragstart="handleDragstart"
        @dragend="handleDragEnd($event,item)"
        :title="item.description"
    >
      <div class="project-node-list-item-icon"><a-icon type="login" /></div>
      <div style="font-size: 12px">{{item.name}}</div>
    </div>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import okSvg from "@/assets/icons/ok.svg";
import inSvg from '@/assets/icons/in.svg'
import wrongSvg from "@/assets/icons/wrong.svg"
import {mapMutations, mapState} from "vuex";
import LoadingBoxFrame from '@/components/frame/loading-box-frame'
export default {
  name: "project-node-list-box",
  components: {
    'loading-box-frame': LoadingBoxFrame
  },
  data() {
    return {
      page: null,
      command: null,
      offsetX: 0,
      offsetY: 0,
      list: [
        // {
        //   name: "测试节点",
        //   label: "测试节点",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]]
        // },
        // //
        // // {
        // //   name: "背景图片节点",
        // //   label: "背景图片节点",
        // //   size: "170*34",
        // //   type: "node",
        // //   x: 0,
        // //   y: 0,
        // //   shape: "customNode",
        // //   color: "#1890ff",
        // //   image:
        // //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        // //   stateImage: okSvg,
        // //   backImage: bgImg,
        // //   inPoints: [[0, 0.5]],
        // //   outPoints: [[1, 0.5]]
        // // },
        // {
        //   name: "双输出节点",
        //   label: "双输出节点",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.4], [1, 0.6]]
        // },
        // // {
        // //   name: "大型节点",
        // //   label: "大型节点",
        // //   size: "340*34",
        // //   type: "node",
        // //   x: 0,
        // //   y: 0,
        // //   shape: "customNode",
        // //   color: "#1890ff",
        // //   image:
        // //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        // //   stateImage: okSvg,
        // //   inPoints: [[0, 0.5]],
        // //   outPoints: [[1, 0.5]]
        // // },
        // // {
        // //   name: "动画开始节点",
        // //   label: "动画开始",
        // //   size: "170*34",
        // //   type: "node",
        // //   x: 0,
        // //   y: 0,
        // //   shape: "customNode",
        // //   color: "#1890ff",
        // //   image:
        // //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        // //   stateImage: okSvg,
        // //   inPoints: [[0, 0.5]],
        // //   outPoints: [[1, 0.5]],
        // //   isDoingStart: true
        // // },
        // // {
        // //   name: "动画结束节点",
        // //   label: "动画结束",
        // //   size: "170*34",
        // //   type: "node",
        // //   x: 0,
        // //   y: 0,
        // //   shape: "customNode",
        // //   color: "#1890ff",
        // //   image:
        // //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        // //   stateImage: okSvg,
        // //   inPoints: [[0, 0.5]],
        // //   outPoints: [[1, 0.5]],
        // //   isDoingEnd: true
        // // }
      ],
      loading: false,
      nodesLoading: false,
      nodeData: []
    };
  },
  computed: {
    ...mapState(['host', 'buildGetQuery', 'nodeType'])
  },
  methods: {
    ...mapMutations(["saveNodeData", "saveNodeType", "saveNodeExtra"]),
    handleDragstart(e) {
      this.offsetX = e.offsetX;
      this.offsetY = e.offsetY;
    },
    handleDragEnd(e, item) {
      let that = this
      let data = {};
      Object.assign(data, item);
      data.offsetX = this.offsetX;
      data.offsetY = this.offsetY;
      if (that.page) {
        const graph = this.page.graph;
        // const size = e.target.dataset.size.split("*");
        const xy = graph.getPointByClient(e.x, e.y);
        data.x = xy.x;
        data.y = xy.y;
        data.size = item.size.split("*");
        data.type = "node";
        that.newNodeSubmit(item.node_type)
        .then(result => {
          data.id = result.id
          that.command.executeCommand("add", [data]);
          that.saveNodeExtra({id:result.id, extra:{x:xy.x, y:xy.y}})
        })
      }
    },
    bindEvent() {
      eventBus.$on("afterAddPage", page => {
        this.page = page;
        this.command = page.command;
      });
    },
    loadNodeData() {
      let that = this
      that.loading = true
      that.$http.get(that.host + '/node/description')
          .then(data => {
            that.nodeData = data.data.data
            console.log(that.nodeData)
            that.initNodeData()
            that.loadProjectNodes()
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(()=>{
            that.loading = false
          })
    },
    initNodeData() {
      let that = this
      that.list = []
      for (let item of that.nodeData) {
        let itemBuild = {
          name: item.name,
          label: item.name,
          size: "170*34",
          type: "node",
          x: 0,
          y: 0,
          shape: "customNode",
          color: "#1890ff",
          image: inSvg,
          stateImage: wrongSvg,
          inPoints: item.input_type ? [[0, 0.5]] : [],
          outPoints: [[1, 0.5]],
          description: item.description,
          node_type: item.type,
          params: item.params
        }
        that.list.push(itemBuild)
        this.saveNodeType(itemBuild)
        break;
      }
    },
    newNodeSubmit(node_type) {
      let that = this
      return new Promise((resolve, reject) => {
        let project_id = that.$route.params.id
        let sendData = new FormData()
        sendData.append('project_id', project_id)
        sendData.append('node_type', node_type)
        that.$http.post(that.host + `/node`, sendData)
            .then(data => {
              resolve(data.data)
            })
            .catch((error) => {
              if (error.response) {
                that.$message.error(error.response.data.message)
              } else {
                that.$message.error('请求失败')
              }
              reject()
            })
      })
    },
    loadProjectNodes() {
      let that = this
      let project_id = that.$route.params.id
      that.nodesLoading = true
      that.$http.get(that.host + '/node' + that.buildGetQuery({project_id: project_id}))
          .then(data => {
            let Data =  data.data.nodes
            for (let item of Data) {
              that.addNode(item)
            }
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(()=>{
            that.nodesLoading = false
          })
    },
    addNode(node) {
      let that = this
      let data = {};
      let item = that.nodeType.get(node.node_type)
      Object.assign(data, item);
      data.offsetX = this.offsetX;
      data.offsetY = this.offsetY;
      if (that.page) {
        data.x = node.extra.x ? node.extra.x : 0;
        data.y = node.extra.y ? node.extra.y : 0;
        data.size = "170*34".split("*");
        data.type = "node";
        if (Object.keys(node.extra).length >= that.nodeType.get(node.node_type).params.length + 2) {
          data.stateImage = okSvg
        }
        data.id = node.id
        that.command.executeCommand("add", [data]);
        that.saveNodeData(data)
        that.saveNodeExtra({id:node.id, extra:node.extra})
      }
    }
  },
  created() {
    this.bindEvent();
    this.loadNodeData()
  },
}
</script>

<style scoped>
  .project-node-list-box{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .project-node-list-item{
    width: 90px;
    height: 100px;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
  .project-node-list-item-icon{
    width: 50px;
    height: 50px;
    font-size: 36px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,21,41,.21);
  }
</style>
