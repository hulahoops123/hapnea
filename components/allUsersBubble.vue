<template>
<div class="flex flex-col ring-2 rounded-full bg-neutral-600 justify-center align-middle relative  items-center">
    <img :src="props.userData.photoURL" class="rounded-full h-12 absolute -top-4 w-12 bg-cover" alt="" referrerpolicy="no-referrer">

    <p class="text-md font-raleway font-bold flex  text-blue-700 bg-neutral-100 shadow-lg ring-1 rounded-md p-0.5 ">{{ props.userData.userName }}</p>

            <div v-for="category in Object.keys(props.adminData[0].categories[0])" class="grid grid-cols-2 border-black bordr w-2/3">
                <p class="flex justify-center font-staatliches text-xl text-neutral-300">{{ category }}</p>
                <p class="w-12 text-center font-staatliches text-xl text-purple-200"> {{props.userData[category] ? props.userData[category] : '-'}}</p>
            </div>
        </div>
</template>

<script setup>
const emits = defineEmits(['input-changed'],'himom');
const props = defineProps(["userData", "adminData", 'chosenCategory']);

</script>

<style>

</style>