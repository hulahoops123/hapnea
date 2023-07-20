<template>
    <div v-if="isAuthenticated" class="flex flex-col items-center justify-center">
        <div class="flex flex-col w-96 ring-2 rounded-full h-96 justify-evenly  items-center">
            <img :src="userData.photoURL" class="rounded-full w-16 h-16" alt="" referrerpolicy="no-referrer">
            <p class="text-4xl font-raleway font-bold text-gray-700">{{ userData.userName }}</p>
            <div v-for="category in Object.keys(adminData[0].categories[0])" class="grid grid-cols-2 border-black bordr w-2/3">
                <p class="flex justify-center font-staatliches text-xl text-neutral-500">{{ category }}</p>
                <div v-if="adminData[0].categories[0][category] != 'time'" class="flex align-middle">
                    <input @input="theInputChanged($event.target.value, category)" type="number" min="0" max="99" inputmode="numeric" class="w-12 text-center font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="userData[category] ? userData[category] : '-'">
                    <p class="text-xs align-text-bottom self-center font-raleway text-neutral-400 pl-2">metres</p>
                </div>
                <div v-else class="flex">
                    <input @input="theInputChanged($event.target.value+':'+(userData[category] ? (userData[category].split(':')[1]) : 0), category)" type="number" min="0" max="50" inputmode="numeric" class="w-6 text-right font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="userData[category] ? (userData[category]).split(':')[0] : '-'">
                    <p class="align-text-bottom self-center font-raleway text-neutral-400 px-0.5">:</p>
                    <input @input="theInputChanged((userData[category] ? (userData[category].split(':')[0]) : 0)+':'+$event.target.value, category)" type="number" min="0" max="59" inputmode="numeric" class="w-6 font-staatliches text-2xl placeholder-blue-600 text-purple-800" :placeholder="userData[category] ? (userData[category]).split(':')[1] : '-'">
                    <p class="text-xs align-text-bottom self-center font-raleway text-neutral-400">mm:ss</p>
                </div>
            </div>
                <!-- <button class="bg-red-300 ring-4 rounded-full h-8 w-8" @click="logOut">🔙</button> -->
        </div>
    </div>

    <div v-else class="flex flex-col gap-4 font-staatliches text-3xl">
        <button @click="signIn" class="ring-2">
            Sign In with Google
        </button>
        <div class="flex">
            {{ phoneNumber }}
            <input class="ring-2" type="tel"  @input="phoneNumber=$event.target.value">
            <button class="ring-2" @click="signInWithPN">
                Sign In with tel
            </button>
            <div ref="ele" id="ele"></div>
        </div>
        <div class="flex" v-if="confirmationResult">
            <input class="ring-2"  @input="verificationCode=$event.target.value">
            <button class="ring-2" @click="verifyCode">
                verify code
            </button>
        </div>
    </div>
    <p class="mt-20" @click="console.log(adminData[0].categories[0].STA)">click</p>
</template>
<script setup>
import { GoogleAuthProvider, RecaptchaVerifier, getAuth, signInWithPopup, signOut, signInWithPhoneNumber } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, doc, getDoc, query, setDoc } from 'firebase/firestore';
const { firestore, firebaseApp, auth } = useFirebase();
const { isAuthenticated, user:authenticatedUser } = useAuth(auth);

const phoneNumber = ref(null);
const verificationCode = ref(null);
const recaptcha = ref(null);
const confirmationResult= ref(null);

const userQuery = computed(() => authenticatedUser.value && doc(firestore, 'users', authenticatedUser.value.uid));
const userData = useFirestore(userQuery, null);

const adminQuery = computed(() => authenticatedUser.value && collection(firestore, 'admin'));
const adminData = useFirestore(adminQuery,null);

const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());



async function theInputChanged(newNumber, category){
    const userRef = doc(firestore,'users',authenticatedUser.value.uid);
    useDebounce(async () => await setDoc(userRef,{[category]:newNumber},{merge:true}),500);
}
// async function theInputChanged(newNumber, category){
//     const userRef = doc(firestore,'users',authenticatedUser.value.uid);
//     await setDoc(userRef,{[category]:newNumber},{merge:true});
// }

watch(isAuthenticated, async () => {
    //if the user is autenticated try to get their userprofile from firestore
    if (isAuthenticated.value === true){
        const userRef = doc(firestore,'users',authenticatedUser.value.uid);
        const docSnap =await getDoc(userRef);
        if (!docSnap.exists()){
            console.log('document does not exist');
            await setDoc(userRef,{
                userId: authenticatedUser.value.uid,
                userName: authenticatedUser.value.displayName,
                photoURL: authenticatedUser.value.photoURL,
                email: authenticatedUser.value.email
            });
        } 
    }
})

const logOut = () => {
  signOut(auth).catch((err) => {
    console.error(err);
  });
};
onMounted(() => {
    watchEffect(() => {
        if (!recaptcha.value) {
            const verifier = new RecaptchaVerifier('ele', {
                size: 'invisible',
            },auth);
            verifier.verify().then(() => recaptcha.value = verifier);
        }
    });
});
async function signInWithPN(){
    confirmationResult.value = await signInWithPhoneNumber(auth,`+27${phoneNumber.value}`,recaptcha.value);
}
async function verifyCode(){
    const result = await confirmationResult.value.confirm(verificationCode.value);
    console.log(result);
}





</script>

