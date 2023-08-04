<template>
    <div v-if="isAuthenticated" class="flex flex-col items-center overflow-scroll h-screen" ref="mainContainerElement" >
        <div class="flex  bg-cyan-700 items-center w-full p-3">
            <p class="text-4xl font-staatliches text-neutral-300 tracking-wider">HSQUAD PB<span class="align-super ml-0.5 text-xs">s</span></p>
            <Icon name="line-md:chevron-down-circle" class="-rotate-180 h-8 w-8 text-pink-500 ml-auto" @click="logOut"></Icon>
        </div>
        <div v-if="adminData" class="flex items-center justify-center text-neutral-300 w-full gap-2 bg-cyan-700 sticky top-0 z-50">
                <Icon name="line-md:align-center" class="text-neutral-300 h-10 w-10 "></Icon>
                <p>{{ isScrolling }}</p>
                <select name="categories" id="categories" class="bg-cyan-700 text-2xl font-raleway font-black"
                    v-model="chosenSort">
                    <option disabled value="">sort</option>
                    <option v-for="category in Object.keys(adminData[0].categories[0])" :value="category">{{ category }}
                    </option>
                </select>
                <Icon name="line-md:question-circle" class="text-neutral-400 h-7 w-7 ml-auto "></Icon>
        </div>
        <div v-if="userData && adminData" class="flex flex-col justify-center items-center w-full" >
            <UserBubble class="h-80 w-80 mb-12" :admin-data="adminData" :user-data="userData"
                @input-changed="theInputChanged"></UserBubble>
            <div class="grid grid-cols-1">
                    <div v-for="user in allUserData">
                        <AllUsersBubble class="h-48 w-48 my-4" :admin-data="adminData" :key="user" :user-data="user"
                            @input-changed="theInputChanged"></AllUsersBubble>
                    </div>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col gap-4 font-staatliches text-3xl">
        <button @click="signIn" class="ring-2">
            Sign In with Google
        </button>
        <div class="flex">
            {{ phoneNumber }}
            <input class="ring-2" type="tel" @input="phoneNumber = $event.target.value">
            <button class="ring-2" @click="signInWithPN">
                Sign In with tel
            </button>
            <div ref="ele" id="ele"></div>
        </div>
        <div class="flex" v-if="confirmationResult">
            <input class="ring-2" @input="verificationCode = $event.target.value">
            <button class="ring-2" @click="verifyCode">
                verify code
            </button>
        </div>
    </div>
    <p class="mt-20" @click="createMulti">createMulti</p>
    <p class="mt-20" @click="deleteMulti">deleteMulti</p>
</template>
<script setup>
import { GoogleAuthProvider, RecaptchaVerifier, getAuth, signInWithPopup, signOut, signInWithPhoneNumber } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, deleteDoc, doc, getDoc, query, setDoc } from 'firebase/firestore';

const { firestore, firebaseApp, auth } = useFirebase();
const { isAuthenticated, user: authenticatedUser } = useAuth(auth);

const phoneNumber = ref(null);
const verificationCode = ref(null);
const recaptcha = ref(null);
const confirmationResult = ref(null);

const userQuery = computed(() => authenticatedUser.value && doc(firestore, 'users', authenticatedUser.value.uid));
const userData = useFirestore(userQuery, null);

const adminQuery = computed(() => authenticatedUser.value && collection(firestore, 'admin'));
const adminData = useFirestore(adminQuery, null);

const allUserQuery = computed(() => authenticatedUser.value && collection(firestore, 'users'));
const allUserData = useFirestore(allUserQuery, null);

const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());

const mainContainerElement = ref(null);
const { x, y, isScrolling, arrivedState, directions } = useScroll(mainContainerElement);

const chosenSort = ref('');
watch(() => [chosenSort.value, allUserData.value],
    () => {
        let temp = allUserData.value;
        temp.sort((a,b) => {
            if (a[chosenSort.value] > b[chosenSort.value]) { return 1; }
            if (a[chosenSort.value] < b[chosenSort.value]) { return -1; }
            return 0
        } )
        console.log(temp);
        allUserData.value = temp;
    })

async function theInputChanged(newNumber, category) {
    const userRef = doc(firestore, 'users',authenticatedUser.value.uid);
    useDebounce(async () => await setDoc(userRef, { [category]: newNumber }, { merge: true }), 500);
}

async function deleteMulti(){
    console.log('hi dad');
    allUserData.value.forEach(async element => {
        if (element.userName != 'Jonathan Michael'){
            const docRef =doc(firestore, 'users', element.userId);
            await deleteDoc(docRef).then(()=>console.log('deleted')).catch((error=>console.log(error)));

        }else{
            console.log(element.userName);
        }
    });
}
async function createMulti() {
    for (let index = 0; index < 25; index++) {
        const {data} = await useFetch(() => 'https://randomuser.me/api/');
        const newProfile = {
            userId: data.value.results[0].login.uuid,
            userName: data.value.results[0].name.first,
            photoURL: data.value.results[0].picture.thumbnail,
            email: data.value.results[0].email,
            DNF: Math.floor(Math.random() * 110),
            DYN: Math.floor(Math.random() * 150),
            ['16 x 25']:Math.floor(Math.random()*50)+14 + ':' + Math.floor(Math.random()*59),
            STA:Math.floor(Math.random()*10) + ':' + Math.floor(Math.random()*59),
        }
        console.log(newProfile);
        const userRef = doc(firestore, 'users', data.value.results[0].login.uuid);
        await setDoc(userRef, newProfile);
    }
}

watch(isAuthenticated, async () => {
    //if the user is autenticated try to get their userprofile from firestore
    if (isAuthenticated.value === true) {
        const userRef = doc(firestore, 'users', authenticatedUser.value.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            console.log('document does not exist');
            await setDoc(userRef, {
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
            }, auth);
            verifier.verify().then(() => recaptcha.value = verifier);
        }
    });
});
async function signInWithPN() {
    confirmationResult.value = await signInWithPhoneNumber(auth, `+27${phoneNumber.value}`, recaptcha.value);
}
async function verifyCode() {
    const result = await confirmationResult.value.confirm(verificationCode.value);
    console.log(result);
}





</script>

