<!-- <template>
    <div ref="mainContainerElement" class=" flex flex-col w-full h-screen  overflow-scroll bg-blue-500 ">
        <p class=" font-raleway bg-red-500 h-96 shrink-0 ">hi mom{{ isScrolling }}</p>
        <p class="  font-staatliches bg-red-500 h-96 shrink-0 ">hi mom{{ isScrolling }}</p>
        <p class=" bg-red-500 h-96 shrink-0 ">hi mom{{ isScrolling }}</p>
    </div>
</template>

<script setup>
const mainContainerElement = ref(null);
const { x, y, isScrolling, arrivedState, directions } = useScroll(mainContainerElement);

</script>

<style  scoped>

</style> -->
<template>
    <NuxtLink to="/signin">
      signin page
    </NuxtLink>
</template>