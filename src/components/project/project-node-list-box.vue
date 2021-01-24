<template>
  <div class="project-node-list-box">
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
    >
      <div class="project-node-list-item-icon"><a-icon type="dot-chart" /></div>
      <div style="font-size: 12px">{{item.name}}</div>
    </div>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import okSvg from "@/assets/icons/ok.svg";
// import bgImg from "@/assets/bg.jpg";
export default {
  name: "project-node-list-box",
  data() {
    return {
      page: null,
      command: null,
      offsetX: 0,
      offsetY: 0,
      list: [
        {
          name: "测试节点",
          label: "测试节点",
          size: "170*34",
          type: "node",
          x: 0,
          y: 0,
          shape: "customNode",
          color: "#1890ff",
          image:
              "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
          stateImage: okSvg,
          inPoints: [[0, 0.5]],
          outPoints: [[1, 0.5]]
        },
        //
        // {
        //   name: "背景图片节点",
        //   label: "背景图片节点",
        //   size: "170*34",
        //   type: "node",
        //   x: 0,
        //   y: 0,
        //   shape: "customNode",
        //   color: "#1890ff",
        //   image:
        //       "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
        //   stateImage: okSvg,
        //   backImage: bgImg,
        //   inPoints: [[0, 0.5]],
        //   outPoints: [[1, 0.5]]
        // },
        {
          name: "双输出节点",
          label: "双输出节点",
          size: "170*34",
          type: "node",
          x: 0,
          y: 0,
          shape: "customNode",
          color: "#1890ff",
          image:
              "https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg",
          stateImage: okSvg,
          inPoints: [[0, 0.5]],
          outPoints: [[1, 0.4], [1, 0.6]]
        },
        // {
        //   name: "大型节点",
        //   label: "大型节点",
        //   size: "340*34",
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
        // {
        //   name: "动画开始节点",
        //   label: "动画开始",
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
        //   outPoints: [[1, 0.5]],
        //   isDoingStart: true
        // },
        // {
        //   name: "动画结束节点",
        //   label: "动画结束",
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
        //   outPoints: [[1, 0.5]],
        //   isDoingEnd: true
        // }
      ]
    };
  },
  created() {
    this.bindEvent();
  },
  methods: {
    handleDragstart(e) {
      this.offsetX = e.offsetX;
      this.offsetY = e.offsetY;
    },
    handleDragEnd(e, item) {
      let data = {};
      Object.assign(data, item);
      data.offsetX = this.offsetX;
      data.offsetY = this.offsetY;
      if (this.page) {
        const graph = this.page.graph;
        // const size = e.target.dataset.size.split("*");
        const xy = graph.getPointByClient(e.x, e.y);
        data.x = xy.x;
        data.y = xy.y;
        data.size = item.size.split("*");
        data.type = "node";
        this.command.executeCommand("add", [data]);
      }
    },
    bindEvent() {
      eventBus.$on("afterAddPage", page => {
        this.page = page;
        this.command = page.command;
      });
    }
  }
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
