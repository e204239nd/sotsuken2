const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer"); //ファイル書き出し用のライブラリ
const whiteboadRouter = require("./routes/whiteboadsRoutes");
app.use(whiteboadRouter);
app.use(express.static("public"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const time = new Date().getTime();
    const fileName = `${time}_${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

//トップページの表示  
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//画像のアップロード
app.post("/upload", upload.single("img"), (req, res) => {
  /* 画像ファイルをBase64に変換する */
  let fs = require("fs");

  fs.readFile(req.file.path, function (err, content) {
    if (err) {
      console.error(err);
    } else {
      /* Base64変換 */
      let base64_data = "data:image/jpeg;base64," + content.toString("base64");
      res.json({ message: "アップロード成功！", imagePath: base64_data });
    }
  });
});

// ホワイトボードの状態保存
app.post("/update", (req, res) => {
  req.json({ message: "ホワイトボードの保存が成功しました！" });
});

app.listen(3001, () => {
  console.log("サーバが起動");
});

mongoose
  .connect(
    "mongodb+srv://whiteboader:1213@cluster0.7pxph9u.mongodb.net/whiteboad?retryWrites=true&w=majority"
  )
  .then(() => console.log("データベース接続に成功しました"))
  .catch((err) => console.log(err));
