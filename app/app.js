// بستن مودال با کلیک بیرون
window.addEventListener("click", (e) => {

    if (e.target.classList.contains("modal")) {

        closeAllModals();

    }

});

// بستن همه مودال ها
function closeAllModals(){

    document.querySelectorAll(".modal")
    .forEach(modal => {

        modal.style.display = "none";

    });

    // آزاد شدن اسکرول
    document.body.style.overflow = "auto";

}
const API_URL =
    "http://arefs-MacBook-Air.local:3000";
function getCurrentUser(){
    try{
        return JSON.parse(
            localStorage.getItem("user")
        );
    }catch(error){
        return null;
    }
}

// REGISTER
async function register(){

    const inputs = document.querySelectorAll(
        "#registerBox input, #registerBox textarea"
    );

    const user = {

        firstName: inputs[0].value,
        lastName: inputs[1].value,
        username: inputs[2].value,
        mobile: inputs[3].value,
        nationalCode: inputs[4].value,
        address: inputs[5].value,
        password: inputs[6].value

    };

    const response = await fetch(`${API_URL}/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)
        }
    );

    const data = await response.json();

    alert(data.message);

    if(data.success){

        showLogin();

    }

}

// LOGIN
async function login(){

    const inputs = document.querySelectorAll(
        "#loginBox input"
    );

    const user = {

        username: inputs[0].value,
        password: inputs[1].value

    };

    const response = await fetch(`${API_URL}/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)
        }
    );

    const data = await response.json();

    if(data.success){

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        enterDashboard();

    }else{

        alert(data.message || "نام کاربری یا رمز اشتباه است");

    }

}

function enterDashboard(){

    const user = getCurrentUser();
    if(!user){

        logout();

        return;

    }
    document.getElementById("mainNavbar").style.display = "flex";
    document.getElementById("authBox").style.display = "none";

    document.getElementById("dashboard").classList.add("active");
    if(
        user.role === "employee"
        ||
        user.role === "admin"
    ){

        document.getElementById(
            "employeePanel"
        ).style.display = "block";

        loadPendingUsers();
        loadPendingPosts();

        // فقط ادمین پنل مدیریت کاربران را ببیند
        if(user.role === "admin"){

            loadUsers();
            loadAdminPosts();

            document.getElementById(
                "adminPanel"
            ).style.display = "block";

        }else{

            document.getElementById(
                "adminPanel"
            ).style.display = "none";

        }

        document.getElementById(
            "userPanel"
        ).style.display = "none";

    }
    else{

        document.getElementById(
            "userPanel"
        ).style.display = "block";

        document.getElementById(
            "adminPanel"
        ).style.display = "none";

    }

    loadPosts();
    loadConversations();

}

function showTab(tab){

    closeAllModals();

    const giveTab =
        document.getElementById("giveTab");

    const takeTab =
        document.getElementById("takeTab");

    const indicator =
        document.getElementById("toggleIndicator");

    const giveBtn =
        document.getElementById("giveBtn");

    const takeBtn =
        document.getElementById("takeBtn");

    // GIVE
    if(tab === "give"){

        indicator.style.right = "0";

        giveTab.classList.add("active");
        takeTab.classList.remove("active");

        giveBtn.classList.add("toggleActive");
        takeBtn.classList.remove("toggleActive");

    }

    // TAKE
    else{

        indicator.style.right = "50%";

        takeTab.classList.add("active");
        giveTab.classList.remove("active");

        takeBtn.classList.add("toggleActive");
        giveBtn.classList.remove("toggleActive");

    }

}

function logout(){

    localStorage.removeItem("user");

    document.getElementById("dashboard").classList.remove("active");

    document.getElementById("authBox").style.display = "flex";

    document.getElementById("mainNavbar").style.display = "none";

}

window.onload = function(){

    const user = localStorage.getItem("user");

    if(user){

        enterDashboard();
    }
    showTab("give")
    showMobilePage(
    "dashboard",
    document.getElementById("homeNav")
);

}

// LOAD USERS
async function loadUsers(){

    const response = await fetch(`${API_URL}/users`
    );

    const users = await response.json();

    let html = `

        <table class="usersTable">

            <tr>
                <th>ID</th>
                <th>نام</th>
                <th>نام کاربری</th>
                <th>موبایل</th>
                <th>کد ملی</th>
                <th>آدرس</th>
                <th>نقش</th>
                <th>عملیات</th>
            </tr>

    `;

    users.forEach(user => {

        html += `

            <tr>

                <td>${user.id || "-"}</td>

                <td>
                    ${user.firstName || "-"}
                    ${user.lastName || "-"}
                </td>

                <td>${user.username || "-"}</td>

                <td>${user.mobile || "-"}</td>

                <td>${user.nationalCode || "-"}</td>

                <td>${user.address || "-"}</td>

                <td>${user.role || "-"}</td>

                <td>

                    ${user.role !== "admin"

                        ?

                        `<button onclick="deleteUser(${user.id})">
                            حذف
                        </button>`

                        :

                        `ادمین`
                    }

                </td>

            </tr>

        `;

    });

    html += `</table>`;

    document.getElementById("usersList").innerHTML = html;

}

// DELETE USER
async function deleteUser(id){

    const confirmDelete = confirm(
        "کاربر حذف شود؟"
    );

    if(!confirmDelete){
        return;
    }

    const response = await fetch(

        `${API_URL}/users/${id}`,

        {
            method:"DELETE"
        }

    );

    const data = await response.json();

    alert(data.message);

    loadUsers();

}

// LOAD POSTS
async function loadPosts(){
    const exploreBox =
        document.getElementById("explorePosts");

    exploreBox.innerHTML = "";

    const response = await fetch(`${API_URL}/posts`
    );

    const posts = await response.json();

    const currentUser = getCurrentUser();

    const giveBox = document.getElementById(
        "giveActivities"
    );

    const takeBox = document.getElementById(
        "takeActivities"
    );

    giveBox.innerHTML = "";
    takeBox.innerHTML = "";
    let giveCount = 0;
    let takeCount = 0;
    let exploreCount = 0;

    posts.forEach(post => {

        const card = `

            <div class="postCard">

                <div
                    class="postCardClick"
                    onclick="openPostDetails(${post.id})"
                >

                    <div class="postImage">
                        <img src="assets/default.jpg">
                    </div>

                    <div class="postContent">

                        <div class="postTop">

                            <span class="postType">
                                ${post.type === "give"
                                    ? "قرض می‌دهم"
                                    : "قرض می‌گیرم"}
                            </span>

                            <span class="postStatus">
                                ${post.status}
                            </span>

                        </div>

                        <h3>${post.title}</h3>

                        <p class="postDesc">
                            ${post.description}
                        </p>

                        <div class="postMeta">

                            <span>📂 ${post.category}</span>

                            <span>📍 ${post.city}</span>

                        </div>

                    </div>

                </div>

            </div>

        `;

        // آگهی‌های خود کاربر
        if(currentUser && post.userId === currentUser.id){

            giveBox.innerHTML += card;
            giveCount++;

        }

        // آگهی‌های دیگران
        else if(post.status === "active"){

            takeBox.innerHTML += card;
            takeCount++;

        }
        const reel = `

            <div class="reelCard">

                <div class="reelContent">

                    <span class="reelType">
                        ${post.type === "give"
                            ? "قرض می‌دهم"
                            : "قرض می‌گیرم"}
                    </span>

                    <h2>
                        ${post.title}
                    </h2>

                    <p class="reelDesc">
                        ${post.description}
                    </p>

                    <div class="reelMeta">

                        <span>
                            📂 ${post.category}
                        </span>

                        <span>
                            📍 ${post.city}
                        </span>

                    </div>

                </div>

            </div>

        `;
        if(post.status === "active"){
            exploreBox.innerHTML += reel;
            exploreCount++;
        }
    });
    if(giveCount === 0){

        giveBox.innerHTML = `

            <div class="emptyState">

                <h3>
                    آگهی ندارید
                </h3>

                <p>
                    هنوز آگهی ثبت نکرده‌اید.
                </p>

            </div>

        `;

    }

    if(takeCount === 0){

        takeBox.innerHTML = `

            <div class="emptyState">

                <h3>
                    آگهی‌ای پیدا نشد
                </h3>

                <p>
                    هنوز آگهی فعالی وجود ندارد.
                </p>

            </div>

        `;

    }

    if(exploreCount === 0){

        exploreBox.innerHTML = `

            <div class="emptyState">

                <h3>
                    اکسپلور خالی است
                </h3>

                <p>
                    هنوز آگهی تایید شده‌ای وجود ندارد.
                </p>

            </div>

        `;

    }

}
function openPostModal(){
    closeAllModals();

    document.getElementById(
        "postModal"
    ).style.display = "flex";

    document.body.style.overflow = "hidden";

}

function closePostModal(){

    closeAllModals();

    document.getElementById(
        "postModal"
    ).style.display = "none";

    document.body.style.overflow = "auto";

}

async function submitPost(){

    const type = document.getElementById(
        "postType"
    ).value;

    const user = getCurrentUser();

    const post = {

        userId: user.id,

        type: type,

        title: document.getElementById(
            "postTitle"
        ).value,

        description: document.getElementById(
            "postDescription"
        ).value,

        category: document.getElementById(
            "postCategory"
        ).value,

        city: document.getElementById(
            "postCity"
        ).value

    };

    const response = await fetch(`${API_URL}/posts`,
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify(post)

        }
    );

    const data = await response.json();

    alert(data.message);

    closePostModal();

    loadPosts();

}

function openProfile(){

    closeAllModals();

    const user = getCurrentUser();

    document.getElementById(
        "profileName"
    ).innerText =
        user.firstName + " " + user.lastName;

    document.getElementById(
        "profileUsername"
    ).innerText =
        "@" + user.username;

    document.getElementById(
        "profileMobile"
    ).innerText =
        "📞 " + user.mobile;

    document.getElementById(
        "profileAddress"
    ).innerText =
        "📍 " + user.address;

    document.getElementById(
        "profileLogoutBtn"
    ).style.display = "block";

    document.getElementById(
        "profileModal"
    ).style.display = "flex";

    document.body.style.overflow = "hidden";

}

function closeProfile(){
    closeAllModals();

    document.getElementById(
        "profileModal"
    ).style.display = "none";

}
document.querySelector(".searchInput")
.addEventListener("input", function(){

    const value =
        this.value.trim().toLowerCase();

    const cards =
        document.querySelectorAll(".postCard");

    cards.forEach(card => {

        const title =
            card.querySelector("h3")
            ?.innerText
            .toLowerCase() || "";

        const desc =
            card.querySelector(".postDesc")
            ?.innerText
            .toLowerCase() || "";

        const meta =
            card.querySelector(".postMeta")
            ?.innerText
            .toLowerCase() || "";

        const matched =

            title.includes(value)
            ||
            desc.includes(value)
            ||
            meta.includes(value);

        card.style.display =
            matched ? "block" : "none";

    });

});
async function openUserProfile(userId){

    const response = await fetch(`${API_URL}/users`
    );

    const users = await response.json();

    const user = users.find(
        u => u.id === userId
    );

    if(!user){
        return;
    }

    document.getElementById(
        "profileName"
    ).innerText =
        user.firstName + " " + user.lastName;

    document.getElementById(
        "profileUsername"
    ).innerText =
        "@" + user.username;

    document.getElementById(
        "profileMobile"
    ).innerText =
        "📞 " + user.mobile;

    document.getElementById(
        "profileAddress"
    ).innerText =
        "📍 " + user.address;

    document.getElementById(
        "profileLogoutBtn"
    ).style.display = "none";

    document.getElementById(
        "profileModal"
    ).style.display = "flex";

}
function showMobilePage(pageId,btn){
    closeAllModals();

    // همه صفحات موبایل مخفی
    document.querySelectorAll(".mobilePage")
    .forEach(page=>{
        page.classList.remove("active");
    });

    // فقط صفحه انتخابی نمایش داده بشه
    document.getElementById(pageId)
    .classList.add("active");

    // اکتیو شدن دکمه navbar
    document.querySelectorAll(".mobileNav button")
    .forEach(b=>{
        b.classList.remove("activeNav");
    });

    if(btn){
        btn.classList.add("activeNav");
    }

}
let currentChatUser = null;
let currentPostId = null;
let chatInterval = null;

async function openChat(userId, postId){

    closeAllModals();

    currentChatUser = Number(userId);
    currentPostId = Number(postId);

    document.getElementById(
        "chatModal"
    ).style.display = "flex";
    document.body.style.overflow = "hidden";

    loadMessages();
    clearInterval(chatInterval);
    chatInterval = setInterval(() => {
        loadMessages();
    }, 2000);

}

function closeChat(){
    closeAllModals();

    clearInterval(chatInterval);

    document.getElementById(
        "chatModal"
    ).style.display = "none";
    document.body.style.overflow = "auto";

    clearInterval(chatInterval);

    document.body.style.overflow = "auto";

}

async function sendMessage(){
    const text = document.getElementById(
        "chatInput"
    ).value;

    if(!text.trim()) return;

    const user = getCurrentUser();

    await fetch(`${API_URL}/messages`,
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                senderId:user.id,

                receiverId:currentChatUser,

                postId:currentPostId,

                text:text

            })

        }
    );

    document.getElementById(
        "chatInput"
    ).value = "";

    loadMessages();
    loadConversations();

}

async function loadMessages(){

    const response = await fetch(`${API_URL}/messages`
    );

    const messages = await response.json();

    const user = getCurrentUser();

    const box =
        document.getElementById("chatMessages");

    box.innerHTML = "";

    let messageCount = 0;

    messages.forEach(message => {

        const related =

            message.postId === currentPostId

            &&

            (
                (
                    message.senderId === user.id
                    &&
                    message.receiverId === currentChatUser
                )

                ||

                (
                    message.senderId === currentChatUser
                    &&
                    message.receiverId === user.id
                )
            );

        if(related){

            const isMe =
                message.senderId === user.id;
            messageCount++;
            box.innerHTML += `

                <div class="
                    chatBubble
                    ${isMe ? "myMessage" : "otherMessage"}
                ">

                    ${message.text}

                </div>

            `;

        }
        box.scrollTop = box.scrollHeight;

    });
    if(messageCount === 0){

        box.innerHTML = `

            <div class="emptyState">

                <h3>
                    هنوز پیامی نیست
                </h3>

                <p>
                    اولین پیام گفتگو را ارسال کنید.
                </p>

            </div>

        `;

    }

}
async function loadConversations(){

    const user = getCurrentUser();

    const response = await fetch(`${API_URL}/conversations`
    );

    const conversations = await response.json();

    const usersResponse = await fetch(`${API_URL}/users`
    );

    const users = await usersResponse.json();

    const box =
        document.getElementById(
            "conversationsList"
        );

    box.innerHTML = "";
    let conversationCount = 0;

    conversations.forEach(conversation => {

        const related =

            conversation.user1 === user.id
            ||
            conversation.user2 === user.id;

        if(!related){
            return;
        }

        const otherUserId =

            conversation.user1 === user.id
            ?
            conversation.user2
            :
            conversation.user1;

        const otherUser = users.find(
            u => u.id === otherUserId
        );
        if(!otherUser){
            return;
        }
        conversationCount++;
        box.innerHTML += `

            <div
                class="conversationCard"

                onclick="
                    openChat(
                        ${otherUserId},
                        ${conversation.postId}
                    )
                "
            >


                <div class="conversationName">
                    

                    ${otherUser.firstName}
                    ${otherUser.lastName}

                </div>

                <div class="conversationLast">

                    ${conversation.lastMessage}

                </div>

                <div class="conversationTime">

                    ${conversation.updatedAt}

                </div>

            </div>

        `;

    });
    if(conversationCount === 0){

        box.innerHTML = `

            <div class="emptyState">

                <h3>
                    گفتگویی ندارید
                </h3>

                <p>
                    هنوز پیامی ارسال نشده است.
                </p>

            </div>

        `;

    }

}
function showLogin(){

    document
        .getElementById("loginBox")
        .classList.add("active");

    document
        .getElementById("registerBox")
        .classList.remove("active");

    document
        .getElementById("loginTabBtn")
        .classList.add("activeAuth");

    document
        .getElementById("registerTabBtn")
        .classList.remove("activeAuth");

}

function showRegister(){

    document
        .getElementById("registerBox")
        .classList.add("active");

    document
        .getElementById("loginBox")
        .classList.remove("active");

    document
        .getElementById("registerTabBtn")
        .classList.add("activeAuth");

    document
        .getElementById("loginTabBtn")
        .classList.remove("activeAuth");

}
async function loadPendingUsers(){

    const response = await fetch(
        `${API_URL}/users`
    );

    const users = await response.json();

    const box =
        document.getElementById(
            "pendingUsers"
        );

    box.innerHTML = "";
    let pendingUsersCount = 0;

    users.forEach(user => {

        if(user.approved){
            return;
        }
        pendingUsersCount++;
        box.innerHTML += `

            <div class="conversationCard">

                <div class="conversationName">

                    ${user.firstName}
                    ${user.lastName}

                </div>

                <div class="conversationLast">

                    @${user.username}

                </div>

                <button
                    onclick="
                        approveUser(${user.id})
                    "
                >
                    تایید کاربر
                </button>

            </div>

        `;

    });
    if(pendingUsersCount === 0){

        box.innerHTML = `

            <div class="emptyState">

                <h3>
                    کاربر در انتظار تایید نیست
                </h3>

                <p>
                    همه کاربران تایید شده‌ اند.
                </p>

            </div>

        `;

    }

}
async function approveUser(id){

    await fetch(
        `${API_URL}/approve-user/${id}`,
        {
            method:"PUT"
        }
    );

    loadPendingUsers();

}
async function loadPendingPosts(){

    const response = await fetch(
        `${API_URL}/posts`
    );

    const posts = await response.json();

    const box =
        document.getElementById(
            "pendingPosts"
        );

    box.innerHTML = "";
    let pendingPostsCount = 0;
    posts.forEach(post => {

        if(post.status !== "pending"){
            return;
        }
        pendingPostsCount++;
        box.innerHTML += `

            <div class="postCard">

                <div class="postContent">

                    <h3>
                        ${post.title}
                    </h3>

                    <p>
                        ${post.description}
                    </p>

                    <div class="adminActions">

                        <button
                            class="approveBtn"
                            onclick="
                                approvePost(${post.id})
                            "
                        >
                            تایید
                        </button>

                        ${
                            post.status === "inactive"

                            ?

                            `

                            <button
                                class="approveBtn"
                                onclick="
                                    activatePost(${post.id})
                                "
                            >
                                ▶️
                            </button>

                            `

                            :

                            `

                            <button
                                class="disableBtn"
                                onclick="
                                    disablePost(${post.id})
                                "
                            >
                                ⏸️
                            </button>

                            `
                        }

                    </div>

                </div>

            </div>

        `;

    });
    if(pendingPostsCount === 0){

        box.innerHTML = `

            <div class="emptyState">

                <h3>
                    آگهی در انتظار تایید نیست
                </h3>

                <p>
                    همه آگهی‌ها بررسی شده‌ اند.
                </p>

            </div>

        `;

    }

}
async function approvePost(id){

    await fetch(
        `${API_URL}/approve-post/${id}`,
        {
            method:"PUT"
        }
    );

    loadPendingPosts();

}
function openMessagesPage(){

    document.querySelectorAll(".mobilePage")
    .forEach(page => {
        page.classList.remove("active");

    });
    document.getElementById("mainNavbar").style.display = "none";

    document.getElementById("messagesPage")
    .classList.add("active");

}
function openHomePage(){
    closeAllModals();

    document.querySelectorAll(".mobilePage")
    .forEach(page => {

        page.classList.remove("active");

    });
    document.getElementById("mainNavbar").style.display = "flex";

    document.getElementById("dashboard")
    .classList.add("active");

}

async function loadAdminPosts(){

    const response = await fetch(
        `${API_URL}/posts`
    );

    const posts = await response.json();

    const usersResponse = await fetch(
        `${API_URL}/users`
    );

    const users = await usersResponse.json();

    const box =
        document.getElementById(
            "adminPosts"
        );

    box.innerHTML = "";

    posts.forEach(post => {

        const owner = users.find(
            u => u.id === post.userId
        );

        box.innerHTML += `

            <div class="adminPostCard">

                <div class="adminPostTop">

                    <h3>
                        ${post.title}
                    </h3>

                    <span class="adminStatus">
                        ${
                            post.status === "active"
                            ? "🟢 فعال"

                            :

                            post.status === "pending"
                            ? "🟡 در انتظار"

                            :

                            post.status === "inactive"
                            ? "⚫ غیرفعال"

                            :

                            post.status === "closed"
                            ? "🔴 بسته"

                            :

                            "❌ رد شده"
                        }
                    </span>

                </div>

                <p class="adminDesc">
                    ${
                        post.description.length > 40
                        ?
                        post.description.slice(0,40) + "..."
                        :
                        post.description
                    }
                </p>

                <div class="adminMeta">

                    <span>
                        👤 ${
                            owner
                            ?
                            owner.firstName
                            :
                            "-"
                        }
                    </span>

                    <span>
                        📍 ${post.city}
                    </span>

                </div>

                <div class="adminActions">

                    <button
                        class="moreBtn"
                        onclick="toggleMenu(this, event)"
                    >
                        ⋮
                    </button>

                    <div class="actionsMenu">

                        <button onclick="editPost(${post.id})">
                            ویرایش
                        </button>

                        ${
                            post.status === "pending"
                            ?
                            `
                            <button onclick="approvePost(${post.id})">
                                تایید
                            </button>
                            `
                            :
                            ""
                        }

                        ${
                            post.status === "inactive"
                            ?
                            `
                            <button onclick="activatePost(${post.id})">
                                فعال کردن
                            </button>
                            `
                            :
                            `
                            <button onclick="disablePost(${post.id})">
                                غیرفعال کردن
                            </button>
                            `
                        }

                        <button onclick="deletePost(${post.id})">
                            حذف
                        </button>

                    </div>

                </div>


            </div>

        `;

    });

}
async function disablePost(id){

    await fetch(

        `${API_URL}/disable-post/${id}`,

        {
            method:"PUT"
        }

    );

    loadPosts();
    loadAdminPosts();
    loadPendingPosts();

}
async function activatePost(id){

    await fetch(

        `${API_URL}/activate-post/${id}`,

        {
            method:"PUT"
        }

    );

    loadPosts();
    loadAdminPosts();
    loadPendingPosts();

}

function toggleMenu(button, event){

    event.stopPropagation();

    const menu = button.nextElementSibling;

    // بستن بقیه منوها
    document
    .querySelectorAll(".actionsMenu")
    .forEach(m => {

        if(m !== menu){
            m.classList.remove("showMenu");
        }

    });

    // باز و بسته کردن منوی فعلی
    menu.classList.toggle("showMenu");

}
document.addEventListener("click", () => {

    document
    .querySelectorAll(".actionsMenu")
    .forEach(menu => {

        menu.classList.remove("showMenu");

    });

});
function openModal(id){

    document.getElementById(id).style.display = "flex";

    document.body.style.overflow = "hidden";

}

function closeModal(id){

    closeAllModals();

}
async function openPostDetails(postId){

    const response = await fetch(`${API_URL}/posts`);

    const posts = await response.json();

    const post = posts.find(p => p.id === postId);

    if(!post) return;

    document.getElementById("postDetailsBody").innerHTML = `

        <div class="postImage">
            <img src="assets/default.jpg">
        </div>

        <div class="postContent">

            <div class="postTop">

                <span class="postType">
                    ${post.type === "give"
                        ? "قرض می‌دهم"
                        : "قرض می‌گیرم"}
                </span>

                <span class="postStatus">
                    ${post.status}
                </span>

            </div>

            <h2>${post.title}</h2>

            <p class="postDesc">
                ${post.description}
            </p>

            <div class="postMeta">

                <span>📂 ${post.category}</span>

                <span>📍 ${post.city}</span>

            </div>

            <div class="detailsActions">

                <button
                    class="mainActionBtn"
                    onclick="openUserProfile(${post.userId})"
                >
                    پروفایل
                </button>

                <button
                    class="mainActionBtn"
                    onclick="openChat(${post.userId}, ${post.id})"
                >
                    💬 پیام
                </button>

            </div>

        </div>

    `;

    openModal("postDetailsModal");

}
const drawer = document.getElementById("drawer");
const menuBtn = document.getElementById("menuBtn");

menuBtn.onclick = () => {

    drawer.classList.toggle("open");

};
function openSupport(){

    alert("پشتیبانی به‌زودی اضافه می‌شود");

}

const overlay =
document.getElementById("drawerOverlay");

menuBtn.onclick = () => {

    drawer.classList.add("open");

    overlay.classList.add("show");

};

overlay.onclick = () => {

    drawer.classList.remove("open");

    overlay.classList.remove("show");

};
document
.getElementById("searchBtn")
.onclick = () => {

document
.getElementById("searchBar")
.classList.toggle("open");

};