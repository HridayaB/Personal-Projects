<script setup lang="ts">
  defineOptions({
    name: 'HomeView'
  })
</script>

<template>
  <h1>Pet Food and Health Tracker</h1>
  <p>
    Welcome to the Pet Food and Health Tracker! This app helps you keep track of your pet's daily food and treat intake, as well other health-related information.
    If you are new here, then let's <router-link to="/get-started">get started</router-link>!
  </p>
  <p>
    <router-link to="/daily-food-tracker">Daily Food Tracker</router-link>
  </p>
  <p>
    <router-link to="/daily-treat-tracker">Daily Treat Tracker</router-link>
  </p>
</template>

<style scoped>
</style>
