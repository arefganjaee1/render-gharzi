const http = require("http");
const fs = require("fs");
const path = require("path");

const conversationsFile = path.join(
    __dirname,
    "../data/conversations.json"
);
const messagesFile = path.join(
    __dirname,
    "../data/messages.json"
);

const usersFile = path.join(
    __dirname,
    "../data/users.json"
);

const postsFile = path.join(
    __dirname,
    "../data/posts.json"
);

if(!fs.existsSync(conversationsFile)){

    fs.writeFileSync(
        conversationsFile,
        "[]"
    );

}
if(!fs.existsSync(messagesFile)){

    fs.writeFileSync(
        messagesFile,
        "[]"
    );

}
const server = http.createServer((req, res) => {
        // =========================
    // STATIC FILES (HTML/CSS/JS)
    // =========================

    let filePath = path.join(
        __dirname,
        "..",
        req.url === "/" ? "index.html" : req.url
    );

    const ext = path.extname(filePath);

    const contentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg"
    };

    const contentType = contentTypes[ext];

    if (contentType && fs.existsSync(filePath)) {

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(fs.readFileSync(filePath));

        return;
    }
    // SEND MESSAGE

    if(req.method === "POST" && req.url === "/messages"){

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const newMessage = JSON.parse(body);

            const messages = JSON.parse(
                fs.readFileSync(messagesFile, "utf8")
            );

            newMessage.id = Date.now();

            newMessage.createdAt =
                new Date().toLocaleString();

                const conversations = JSON.parse(
                    fs.readFileSync(conversationsFile, "utf8")
                );

                let conversation = conversations.find(c =>

                    Number(c.postId) === Number(newMessage.postId)

                    &&

                    (
                        c.user1 === newMessage.senderId
                        ||
                        c.user2 === newMessage.senderId
                    )

                    &&

                    (
                        c.user1 === newMessage.receiverId
                        ||
                        c.user2 === newMessage.receiverId
                    )

                );

                if(!conversation){

                    conversation = {

                        id: Date.now(),

                        postId:newMessage.postId,

                        user1:newMessage.senderId,

                        user2:newMessage.receiverId,

                        lastMessage:newMessage.text,

                        updatedAt:new Date().toLocaleString()

                    };

                    conversations.push(conversation);

                }else{

                    conversation.lastMessage =
                        newMessage.text;

                    conversation.updatedAt =
                        new Date().toLocaleString();

                }

                fs.writeFileSync(

                    conversationsFile,

                    JSON.stringify(conversations, null, 2)

                );
            messages.push(newMessage);

            fs.writeFileSync(
                messagesFile,
                JSON.stringify(messages, null, 2)
            );

            res.writeHead(200,{
                "Content-Type":"application/json",
                "Access-Control-Allow-Origin":"*"
            });

            res.end(JSON.stringify({
                success:true
            }));

        });

        return;

    }
    // GET MESSAGES

    if(req.method === "GET" && req.url === "/messages"){

        const messages = JSON.parse(
            fs.readFileSync(messagesFile, "utf8")
        );

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify(messages));

        return;

    }
    // REGISTER
    if (req.method === "POST" && req.url === "/register") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const newUser = JSON.parse(body);

            const users = JSON.parse(
                fs.readFileSync(usersFile, "utf8")
            );

            newUser.id = users.length + 1;

            if(!newUser.role){
                newUser.role = "user";
            }
            newUser.approved = false;

            const userExists = users.find(
                user => user.username === newUser.username
            );

            if(userExists){

                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                });

                res.end(JSON.stringify({
                    success:false,
                    message:"نام کاربری قبلا ثبت شده"
                }));

                return;
            }

            users.push(newUser);

            fs.writeFileSync(
                usersFile,
                JSON.stringify(users, null, 2)
            );

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });

            res.end(JSON.stringify({
                success:true,
                message:"ثبت نام انجام شد"
            }));

        });

        return;

    }
// APPROVE USER

    if(
        req.method === "PUT"
        &&
        req.url.startsWith("/approve-user/")
    ){

        const id = parseInt(
            req.url.split("/")[2]
        );

        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );

        const user = users.find(
            u => u.id === id
        );

        if(user){

            user.approved = true;

            fs.writeFileSync(
                usersFile,
                JSON.stringify(users, null, 2)
            );

        }

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify({
            success:true
        }));

        return;

    }
    // DELETE USER
    if(req.method === "DELETE" && req.url.startsWith("/users/")){

        const id = parseInt(
            req.url.split("/")[2]
        );

        let users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );

        const userToDelete = users.find(
            user => user.id === id
        );

        if(userToDelete && userToDelete.role === "admin"){

            res.writeHead(200, {
                "Content-Type":"application/json",
                "Access-Control-Allow-Origin":"*"
            });

            res.end(JSON.stringify({
                success:false,
                message:"حذف ادمین مجاز نیست"
            }));

            return;

        }

        users = users.filter(
            user => user.id !== id
        );
        let posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        posts = posts.filter(
            post => post.userId !== id
        );

        fs.writeFileSync(
            postsFile,
            JSON.stringify(posts, null, 2)
        );

        fs.writeFileSync(
            usersFile,
            JSON.stringify(users, null, 2)
        );

        res.writeHead(200, {
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify({
            success:true,
            message:"کاربر حذف شد"
        }));

        return;

    }

    // ADD POST
    if(req.method === "POST" && req.url === "/posts"){

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const postData = JSON.parse(body);

            const posts = JSON.parse(
                fs.readFileSync(postsFile, "utf8")
            );

            const newPost = {

                id: Date.now(),

                userId: postData.userId,

                type: postData.type,

                title: postData.title,

                description: postData.description,

                category: postData.category,

                city: postData.city,

                createdAt: new Date().toLocaleString(),

                status: "pending"

            };
            posts.push(newPost);

            fs.writeFileSync(
                postsFile,
                JSON.stringify(posts, null, 2)
            );

            res.writeHead(200, {
                "Content-Type":"application/json",
                "Access-Control-Allow-Origin":"*"
            });

            res.end(JSON.stringify({
                success:true,
                message:"آگهی برای تایید ارسال شد"
            }));

        });

        return;

    }
    // APPROVE POST

    if(
        req.method === "PUT"
        &&
        req.url.startsWith("/approve-post/")
    ){

        const id = parseInt(
            req.url.split("/")[2]
        );

        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        const post = posts.find(
            p => p.id === id
        );

        if(post){

            post.status = "active";

            fs.writeFileSync(
                postsFile,
                JSON.stringify(posts, null, 2)
            );

        }

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify({
            success:true
        }));

        return;

    }
    // DISABLE POST

    if(
        req.method === "PUT"
        &&
        req.url.startsWith("/disable-post/")
    ){

        const id = parseInt(
            req.url.split("/")[2]
        );

        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        const post = posts.find(
            p => p.id === id
        );

        if(post){

            post.status = "inactive";

            fs.writeFileSync(
                postsFile,
                JSON.stringify(posts, null, 2)
            );

        }

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify({
            success:true
        }));

        return;

    }



    // ACTIVATE POST

    if(
        req.method === "PUT"
        &&
        req.url.startsWith("/activate-post/")
    ){

        const id = parseInt(
            req.url.split("/")[2]
        );

        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        const post = posts.find(
            p => p.id === id
        );

        if(post){

            post.status = "active";

            fs.writeFileSync(
                postsFile,
                JSON.stringify(posts, null, 2)
            );

        }

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify({
            success:true
        }));

        return;

    }

    // LOGIN
    if (req.method === "POST" && req.url === "/login") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const loginData = JSON.parse(body);

            const users = JSON.parse(
                fs.readFileSync(usersFile, "utf8")
            );

            const foundUser = users.find(user =>

                user.username === loginData.username &&
                user.password === loginData.password

            );

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });

            if (foundUser) {
                if(!foundUser.approved){
                    res.end(JSON.stringify({
                        success:false,
                        message:"حساب شما هنوز تایید نشده"
                    }));
                    return;
                }

                res.end(JSON.stringify({
                    success: true,
                    user: foundUser
                }));

            } else {

                res.end(JSON.stringify({
                    success: false
                }));

            }

        });

        return;

    }

    // OPTIONS
    if (req.method === "OPTIONS") {

        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end();

        return;

    }
    if(req.method === "GET" && req.url === "/conversations"){

        const conversations = JSON.parse(
            fs.readFileSync(conversationsFile, "utf8")
        );

        res.writeHead(200,{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify(conversations));

        return;

    }
    // GET USERS
    if(req.method === "GET" && req.url === "/users"){

        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );

        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        });

        res.end(JSON.stringify(users));

        return;

    }

    // GET POSTS
    if(req.method === "GET" && req.url === "/posts"){

        const posts = JSON.parse(
            fs.readFileSync(postsFile, "utf8")
        );

        res.writeHead(200, {
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        });

        res.end(JSON.stringify(posts));

        return;

    }

    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("Server Running");

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port", PORT);
});

server.on("clientError", (err, socket) => {

    console.log("Client disconnected");

    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");

});
