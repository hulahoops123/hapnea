<template>
    <div v-if="isAuthenticated" class="flex flex-col items-center overflow-scroll h-screen " ref="mainContainerElement">
        <div class="flex  bg-cyan-700 items-center w-full p-3">
            <p class="text-4xl font-staatliches text-neutral-300 tracking-wider">hsquad PB<span
                    class="align-super ml-0.5 text-xs">s</span></p>
            <p v-if="isAdminUser" class="font-staatliches ring-1 bg-amber-600 text-neutral-600 ml-6 px-0.5 rounded-sm " @click="showAdminArea = !showAdminArea">admin</p>
            <p class="flex ml-auto underline decoration-pink-500  px-0.5 text-neutral-400" @click="logOut">
                logOut
            </p>
        </div>
        <div v-if="adminData"
            class="flex items-center justify-center text-neutral-300 w-full gap-2 bg-cyan-700 sticky top-0 z-50 p-3">
            <Icon name="line-md:align-center" class="text-neutral-300 h-10 w-10 "></Icon>
            <select name="categories" id="categories" class="bg-cyan-700 text-2xl font-raleway font-black"
                v-model="chosenSort" @change="triggerSort" >
                <option disabled value="">sort</option>
                <option selected v-for="category in Object.keys(disciplines)" :value="category">{{ category }}</option>
            </select>
            <p class="flex w-full justify-start ml-4"> {{ chosenSort != 'userName' ? disciplines[chosenSort].description : '' }} </p>
        </div>
        <onClickOutside @trigger="showAdminArea=false">
            <AdminArea v-if="showAdminArea" :admin-data="adminData" :is-authenticated="isAuthenticated" :disciplines="disciplines" @admin-changed="newDisciplineAdded" ></AdminArea>
        </onClickOutside>

        <div v-if="adminData && allUserData && !showAdminArea" class="relative flex w-full flex-col justify-center items-center">
            <onClickOutside v-if="showUserBubble" @trigger="closeUserBubble"  >
                <UserBubble  class="h-80 w-80 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50 transition-all bg-neutral-100" :disciplines="disciplines" :admin-data="adminData" :user-data="userData" @input-changed="theInputChanged"></UserBubble>
            </onClickOutside>
            <div v-if="showUserBubble" class=" z-10 w-screen h-full backdrop-blur-sm bg-neutral-100/50 absolute"></div>
            <div v-for="user in allUserData">
                <onClickOutside @trigger="otherClickedUserId = ''" >
                    <div v-if="user.userId == authenticatedUser.uid" ref="target" class="w-full h-0.5 bg-transparent"></div>
                    <AllUsersBubble :class="user.userId == otherClickedUserId ? 'scale-150 my-24' : ''" class="transition-all h-48 w-48 my-4" :id="user.userId" :disciplines="disciplines" :key="user.userId"
                    :user-data="user" :chosen-category="chosenSort" @click="authenticatedUser.uid == user.userId ? showUserBubble = true : otherClickedUserId = user.userId"></AllUsersBubble>
                </onClickOutside>
            </div>
            <Icon :class="!showUserBubble && !targetIsVisible ? 'scale-100' : 'scale-0'" @click="scrollToElement" name="line-md:account-small"
                class="transition-all fixed right-5 top-[50%] w-12 text-stone-600 h-12 ring-2 rounded-full flex justify-center items-center"></Icon>
        </div>
    </div>
    <div v-else class="flex flex-col gap-4 font-staatliches text-3xl">
        <button @click="signIn" class="ring-2">
            Sign In with Google
        </button>
    </div>
</template>
<script setup>
import { GoogleAuthProvider, RecaptchaVerifier, getAuth, signInWithPopup, signOut, signInWithPhoneNumber } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, deleteDoc, doc, getDoc, query, setDoc } from 'firebase/firestore';
import { OnClickOutside } from '@vueuse/components';
const { firestore, firebaseApp, auth } = useFirebase();
const { isAuthenticated, user: authenticatedUser } = useAuth(auth);

const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());

const adminQuery = computed(() => authenticatedUser.value && collection(firestore, 'admin'));
const adminData = useFirestore(adminQuery, null);
const disciplines = computed(() => adminData.value.find(({id}) => id === 'disciplines' ));

const allUserQuery = computed(() => authenticatedUser.value && collection(firestore, 'users'));
const allUserData = useFirestore(allUserQuery, null);
const userData = computed(() => allUserData.value.find(({userId}) => userId === authenticatedUser.value.uid ), null);


const mainContainerElement = ref(null);
const { x, y, isScrolling, arrivedState, directions } = useScroll(mainContainerElement);

const showUserBubble = ref(false);
const showAdminArea = ref(false);
const isAdminUser = computed(() => authenticatedUser.value && checkadminid(),false);

const otherClickedUserId  =ref(null);
const elementUserinAllUsers = computed(() => authenticatedUser.value.uid);


const target = ref(null)
const targetIsVisible = useElementVisibility(target);


const chosenSort = ref('userName');

const scrollToElement = () => {
    const el = document.getElementById(elementUserinAllUsers.value);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function checkadminid() {
    if (adminData.value){
        for (const adminItem of adminData.value) {
            if (adminItem.hasOwnProperty("allowedUserIds")) {
                const allowedUsers = adminItem.allowedUserIds;
                if (allowedUsers.includes(authenticatedUser.value.uid)) return true;
                break; // Exit the loop after finding the allowedUserIds
            }
        }
    }
}

function closeUserBubble() {
    showUserBubble.value = false;
    triggerSort();
}

watchOnce(()=>allUserData.value, () => {triggerSort()});

function triggerSort () {
    allUserData.value.sort((a, b) => {
                if (a[chosenSort.value] > b[chosenSort.value]) { return 1; }
                if (a[chosenSort.value] < b[chosenSort.value]) { return -1; }
                return 0
            });
}

async function newDisciplineAdded(newDiscpline) {
    const docRef = doc(firestore, 'admin', 'disciplines');
    useDebounce(async () => await setDoc(docRef, newDiscpline, { merge: true }), 500);
}

async function theInputChanged(newNumber, category) {
    const userRef = doc(firestore, 'users', authenticatedUser.value.uid);
    useDebounce(async () => await setDoc(userRef, { [category]: newNumber }, { merge: true }), 500);
}

async function deleteMulti() {
    console.log('hi dad');
    allUserData.value.forEach(async element => {
        if (element.userName != 'Jonathan Michael') {
            const docRef = doc(firestore, 'users', element.userId);
            await deleteDoc(docRef).then(() => console.log('deleted')).catch((error => console.log(error)));

        } else {
            console.log(element.userName);
        }
    });
}
async function createMulti() {
    for (let index = 0; index < 25; index++) {
        const { data } = await useFetch(() => 'https://randomuser.me/api/');
        const newProfile = {
            userId: data.value.results[0].login.uuid,
            userName: data.value.results[0].name.first,
            photoURL: data.value.results[0].picture.thumbnail,
            email: data.value.results[0].email,
            DNF: Math.floor(Math.random() * 110),
            DYN: Math.floor(Math.random() * 150),
            ['16 x 25']: Math.floor(Math.random() * 50) + 14 + ':' + Math.floor(Math.random() * 59),
            STA: Math.floor(Math.random() * 10) + ':' + Math.floor(Math.random() * 59),
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

</script>

