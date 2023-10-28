const express = require("express");
const app = express();
const multer = require("multer"); //ファイル書き出し用のライブラリ
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
app.post("/update",(req,res) => {
  req.json({message:"ホワイトボードの保存が成功しました！"});
});

app.listen(3000, () => {
  console.log(`サーバが起動しました`);
});
