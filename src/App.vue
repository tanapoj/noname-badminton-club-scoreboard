<template>
  <div id="app">
    <MainTable/>
  </div>
</template>

<script>
import MainTable from './components/MainTable'

export default {
  name: 'App',
  components: {
    MainTable
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 18px;
  color: #2c3e50;
}
</style>
