<script setup lang="ts">
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'

  defineOptions({
    name: 'HomeView'
  })

</script>

<template>
  <main class="home-view" :class="{ 'dark-mode': isDarkMode }">
    <h1>Pet Food and Health Tracker</h1>
    <input id="dark-mode-toggle" v-model="isDarkMode" type="checkbox"/>
    <label for="dark-mode-toggle">
      <Icons :dark-mode="isDarkMode" />
    </label>
    <p>
      Welcome to the Pet Food and Health Tracker! This app helps you keep track of your pet's daily food and treat intake, as well other health-related information.
      If you are new here, then let's <router-link to="/get-started" id="get-started-link">get started</router-link>!
    </p>
    <div class="tracker-links">
      <div class="food-tracker-container">
        <router-link to="/daily-food-tracker" id="daily-food-tracker-link">
          <span>Daily Food Tracker</span>
          <Icons icon="pet-food-1" />
        </router-link>
        <div class="pet-food-icons">
          <Icons icon="pet-food-2" />
          <Icons icon="pet-food-3" />
          <Icons icon="pet-food-4" />
          <Icons icon="pet-food-5" />
          <Icons icon="pet-food-6" />
        </div>
      </div>
      <div class="treat-tracker-container">
        <router-link to="/daily-treat-tracker" id="daily-treat-tracker-link">
          <span>Daily Treat Tracker</span>
          <Icons icon="pet-treat-1" />
        </router-link>
        <div class="pet-treat-icons">
          <Icons icon="pet-treat-2" />
          <Icons icon="pet-treat-3" />
          <Icons icon="pet-treat-4" />
          <Icons icon="pet-treat-5" />
          <Icons icon="pet-treat-6" />
        </div>
      </div>
      <div class="exercise-tracker-container">
        <router-link to="/daily-exercise-tracker" id="daily-exercise-tracker-link">
          <span>Daily Exercise Tracker</span>
          <Icons icon="pet-exercise-1" />
        </router-link>
        <div class="pet-exercise-icons">
          <Icons icon="pet-exercise-2" />
          <Icons icon="pet-exercise-3" />
          <Icons icon="pet-exercise-4" />
          <Icons icon="pet-exercise-5" />
          <Icons icon="pet-exercise-6" />
        </div>
      </div>
      <div class="medicine-tracker-container">
        <router-link to="/daily-medicine-tracker" id="daily-medicine-tracker-link">
          <span>Daily Medicine Tracker</span>
          <Icons icon="pet-medicine-1" />
        </router-link>
        <div class="pet-medicine-icons">
          <Icons icon="pet-medicine-2" />
          <Icons icon="pet-medicine-3" />
          <Icons icon="pet-medicine-4" />
          <Icons icon="pet-medicine-5" />
          <Icons icon="pet-medicine-6" />
        </div>
      </div>
      <div class="potty-tracker-container">
        <router-link to="/daily-potty-tracker" id="daily-potty-tracker-link">
          <span>Daily Potty Tracker</span>
          <Icons icon="pet-potty-1" />
        </router-link>
        <div class="pet-potty-icons">
          <Icons icon="pet-potty-2" />
          <Icons icon="pet-potty-3" />
          <Icons icon="pet-potty-4" />
          <Icons icon="pet-potty-5" />
          <Icons icon="pet-potty-6" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
  .home-view {
    position: relative;
    min-height: 100vh;
    box-sizing: border-box;
    --sun-icon-color: #f2f2f2;
    --moon-icon-color: #242424;
    background: #f2f2f2;
    color: #1a1a1a;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-align: center;
    padding: 3rem;
    transition: background-color 0.3s, color 0.3s;
  }

  .home-view.dark-mode {
    --sun-icon-color: #242424;
    --moon-icon-color: #f2f2f2;
    background: #242424;
    color: #fff;
  }

  label {
    width: 70px;
    height: 30px;
    top: 1.5rem;
    right: 1.5rem;
    position: absolute;
    display: block;
    background: #f2f2f2;
    border-radius: 200px;
    box-shadow: inset 0px 5px 15px rgba(0, 0, 0, 0.4), inset 0px -5px 15px rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: 0.3s;
  }

  label:after {
    content: "";
    width: 28px;
    height: 28px;
    position: absolute;
    bottom: 1px;
    left: 1px;
    z-index: 0;
    background: linear-gradient(180deg, #ffcc89, #d8860b);
    border-radius: 28px;
    box-shadow: inset 0px 5px 10px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
  }

  input {
    width: 0;
    height: 0;
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }

  input:checked + label {
    background: #242424
  }

  input:checked + label:after {
    left: 69px;
    transform: translateX(-100%);
    background: linear-gradient(180deg, #777, #3a3a3a);
  }

  label:active:after {
    width: 35px;
  }

  label :deep(svg) {
    position: absolute;
    width: 25px;
    height: 120px;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
  }

  label :deep(svg.sun-icon) {
    left: 15px;
    transition: 0.3s;
  }

  label :deep(svg.moon-icon) {
    left: 55px;
    transition: 0.3s;
  }

  label :deep(svg.sun-icon path) {
    fill: var(--sun-icon-color);
  }

  label :deep(svg.sun-icon rect) {
    fill: transparent;
  }

  label :deep(svg.moon-icon path) {
    fill: var(--moon-icon-color);
  }

  #get-started-link {
    position: relative;
    text-decoration: none;
    color: #1a1a1a;
    transition: 0.3s;
  }

  .dark-mode #get-started-link {
    color: #f2f2f2;
    transition: 0.3s;
  }

  #get-started-link::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #993638;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease-in-out;
  }

  #get-started-link:hover::before {
    transform: scaleX(1);
  }

  .tracker-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  #daily-food-tracker-link,
  #daily-treat-tracker-link,
  #daily-exercise-tracker-link,
  #daily-medicine-tracker-link,
  #daily-potty-tracker-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 20px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s,
      background-color 0.3s,
      border-color 0.3s,
      box-shadow 0.2s;
  }

  #daily-food-tracker-link:hover,
  #daily-treat-tracker-link:hover,
  #daily-exercise-tracker-link:hover,
  #daily-medicine-tracker-link:hover,
  #daily-potty-tracker-link:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  .dark-mode #daily-food-tracker-link,
  .dark-mode #daily-treat-tracker-link,
  .dark-mode #daily-exercise-tracker-link,
  .dark-mode #daily-medicine-tracker-link,
  .dark-mode #daily-potty-tracker-link {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode #daily-food-tracker-link:hover,
  .dark-mode #daily-treat-tracker-link:hover,
  .dark-mode #daily-exercise-tracker-link:hover,
  .dark-mode #daily-medicine-tracker-link:hover,
  .dark-mode #daily-potty-tracker-link:hover {
    border-color: #993638;
    background-color: #3d3d3d;
  }

  #daily-food-tracker-link :deep(svg.pet-food-1),
  #daily-treat-tracker-link :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link :deep(svg.pet-potty-1) {
    width: 30px;
    height: 30px;
    transition: transform 0.3s ease-in-out;
  }

  #daily-food-tracker-link:hover :deep(svg.pet-food-1),
  #daily-treat-tracker-link:hover :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link:hover :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link:hover :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link:hover :deep(svg.pet-potty-1) {
    transform: scale(1.1);
  }

  .food-tracker-container,
  .treat-tracker-container,
  .exercise-tracker-container,
  .medicine-tracker-container,
  .potty-tracker-container {
    position: relative;
    display: inline-block;
  }

  .pet-food-icons,
  .pet-treat-icons,
  .pet-exercise-icons,
  .pet-medicine-icons,
  .pet-potty-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .pet-food-icons :deep(svg),
  .pet-treat-icons :deep(svg),
  .pet-exercise-icons :deep(svg),
  .pet-medicine-icons :deep(svg),
  .pet-potty-icons :deep(svg) {
    position: absolute;
    width: 30px;
    height: 30px;
    left: 50%;
    top: 0;
    opacity: 0;
    transform: translate(-50%, 12px) scale(0) rotate(0deg);
    transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.45s ease, opacity 0.25s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .pet-food-icons :deep(svg.pet-food-2),
  .pet-treat-icons :deep(svg.pet-treat-2),
  .pet-exercise-icons :deep(svg.pet-exercise-2),
  .pet-medicine-icons :deep(svg.pet-medicine-2),
  .pet-potty-icons :deep(svg.pet-potty-2) {
    --food-left: 10%;
    --food-rotation: -15deg;
  }

  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-2),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-2),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-2),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-2),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-2) {
    left: 10%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-15deg);
    transition-delay: 0s;
  }

  .pet-food-icons :deep(svg.pet-food-3),
  .pet-treat-icons :deep(svg.pet-treat-3),
  .pet-exercise-icons :deep(svg.pet-exercise-3),
  .pet-medicine-icons :deep(svg.pet-medicine-3),
  .pet-potty-icons :deep(svg.pet-potty-3) {
    --food-left: 30%;
    --food-rotation: -8deg;
  }

  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-3),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-3),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-3),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-3),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-3) {
    left: 30%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-8deg);
    transition-delay: 0.07s;
  }

  .pet-food-icons :deep(svg.pet-food-4),
  .pet-treat-icons :deep(svg.pet-treat-4),
  .pet-exercise-icons :deep(svg.pet-exercise-4),
  .pet-medicine-icons :deep(svg.pet-medicine-4),
  .pet-potty-icons :deep(svg.pet-potty-4) {
    --food-left: 50%;
    --food-rotation: 0deg;
  }

  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-4),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-4),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-4),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-4),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-4) {
    left: 50%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(5deg);
    transition-delay: 0.14s;
  }

  .pet-food-icons :deep(svg.pet-food-5),
  .pet-treat-icons :deep(svg.pet-treat-5),
  .pet-exercise-icons :deep(svg.pet-exercise-5),
  .pet-medicine-icons :deep(svg.pet-medicine-5),
  .pet-potty-icons :deep(svg.pet-potty-5) {
    --food-left: 70%;
    --food-rotation: 8deg;
  }

  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-5),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-5),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-5),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-5),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-5) {
    left: 70%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(8deg);
    transition-delay: 0.21s;
  }

  .pet-food-icons :deep(svg.pet-food-6),
  .pet-treat-icons :deep(svg.pet-treat-6),
  .pet-exercise-icons :deep(svg.pet-exercise-6),
  .pet-medicine-icons :deep(svg.pet-medicine-6),
  .pet-potty-icons :deep(svg.pet-potty-6) {
    --food-left: 90%;
    --food-rotation: 15deg;
  }

  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-6),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-6),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-6),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-6),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-6) {
    left: 90%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(15deg);
    transition-delay: 0.28s;
  }

  @media (prefers-reduced-motion: reduce) {
    .pet-food-icons :deep(svg),
    .pet-treat-icons :deep(svg),
    .pet-exercise-icons :deep(svg),
    .pet-medicine-icons :deep(svg),
    .pet-potty-icons :deep(svg) {
      transition: none;
    }
  }


  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
