const port = "10000";
const address = `http://localhost:${port}`;
const fileStart = "file-start";

const jsonServer = require("json-server");

const jsonServerAuth = require("json-server-auth");

const path = require("path");

const multer = require("multer");

const server = jsonServer.create();

const middleWares = jsonServer.defaults();

const router = jsonServer.router(path.join(__dirname, "db.json"));

server.db = router.db;

router.render = (req, res) => {
  res.jsonp({
    data: res.locals.data,
  });
};
server.use(middleWares);
server.use((req, res, next) => {
  if (
    req.originalUrl.startsWith("/api") ||
    req.originalUrl.startsWith(fileStart)
  ) {
    res.header("X-header", "World");
    next();
  } else {
    res.send({
      data: "接口错误",
      success: false,
    });
  }
});

// 设置上传文件的存储路径和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("destination");
    cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    console.log("filename");
    file.name = `${fileStart}${new Date().getTime()}-${file.originalname}`;
    cb(null, file.name);
  },
});

// 限制上传文件的大小-10MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 添加auth中间件
const auth = function (req, res, next) {
  next();
  // if (req.isAuthenticated()) {
  //   next();
  // } else {
  //   res.sendStatus(401);
  // }
};

// 添加上传文件处理的路由，并添加auth中间件
server.post("/api/upload", auth, upload.single("file"), function (req, res) {
  res.send({
    data: `${address}/${req.file.name}`,
    success: true,
  });
});

const rules = jsonServerAuth.rewriter({
  "/api/users/*": "/600/users/$1",
  "/api/login": "/login",
  // "/public/": "/public/",
});

server.use(rules);
server.use(jsonServerAuth);

server.use(router);

server.listen(port, () => {
  console.log(address);
});
