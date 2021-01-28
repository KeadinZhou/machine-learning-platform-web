<template>
  <table border="1" style="border-collapse:collapse">
    <tr v-for="(line,index1) in value" :key="'line'+index1">
      <td v-for="(col,index2) in line" :key="'col'+index1+' '+index2" style="border: solid black 1px">{{col}}</td>
    </tr>
  </table>
</template>

<script>
export default {
  name: "csv-show-table",
  props: {
    value: Array
  }
}
</script>

<style scoped>

</style>
