<template>
<div class="flex flex-col ring-2 rounded-full justify-evenly px-4 py-2  items-center">
            <img :src="props.userData.photoURL" class="rounded-full w-20 h-20" alt="" referrerpolicy="no-referrer">
            <p class="text-2xl font-raleway font-bold text-gray-700">{{ props.userData.userName }}</p>
            <div v-for="category in Object.keys(props.adminData[0].categories[0])" class="grid grid-cols-2 border-black w-3/5">
                <p class="flex justify-center font-staatliches text-xl text-neutral-500">{{ category }}</p>
                <div v-if="props.adminData[0].categories[0][category] != 'time'" class="flex align-middle">
                    <input @input="emits('input-changed',$event.target.value, category)" type="number" min="0" max="99" inputmode="numeric" class="w-12 text-center font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="props.userData[category] ? props.userData[category] : '-'">
                    <p class="text-xs align-text-bottom self-center font-raleway text-neutral-400 pl-2">metres</p>
                </div>
                <div v-else class="flex">
                    <input @input="emits('input-changed',$event.target.value+':'+(props.userData[category] ? (props.userData[category].split(':')[1]) : 0), category)" type="number" min="0" max="50" inputmode="numeric" class="w-6 text-right font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="props.userData[category] ? (props.userData[category]).split(':')[0] : '-'">
                    <p class="align-text-bottom self-center font-raleway text-neutral-400 px-0.5">:</p>
                    <input @input="emits('input-changed',(props.userData[category] ? (props.userData[category].split(':')[0]) : 0)+':'+$event.target.value, category)" type="number" min="0" max="59" inputmode="numeric" class="w-6 font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="props.userData[category] ? (props.userData[category]).split(':')[1] : '-'">
                    <p class="text-xs align-text-bottom self-center font-raleway text-neutral-400">mm:ss</p>
                </div>
            </div>
        </div>
</template>

<script setup>
const emits = defineEmits(['input-changed'],'himom');
const props = defineProps(["userData", "adminData"]);

</script>

<style>

</style>