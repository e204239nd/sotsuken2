const express = require("express");
const app = express();
const whiteboadModel = require("../models/Whiteboad");
app.use(express.json());
/* データの取得 */
app.get("/whiteboads", async (req, res) => {
  /* データベースの中身を全取得 */
  const whiteboads = await whiteboadModel.find({});
  try {
    res.send(whiteboads);
  } catch (err) {
    res.status(500).send(err);
  }
});


//ホワイトボードの読み込み
app.get("/read/:id",async (req,res) => {
  const whiteboads = await whiteboadModel.find({'_id':req.params.id},{"svgData":1});
  console.log(whiteboads[0].svgData);
res.json(whiteboads[0]);
});

/* データの作成 */
app.post("/whiteboad", async (req, res) => {
  const whiteboad = new whiteboadModel(req.body);
  try {
    await whiteboad.save();
    res.json(whiteboad._id);
  } catch (err) {
    res.status(500).send(err);
  }
});

/* データの部分修正 */
app.patch("/whiteboad/:id", async (req, res) => {
  try {
    await whiteboadModel.findByIdAndUpdate(req.params.id,req.body);
    const whiteboads = await whiteboadModel.find({'_id':req.params.id},{"svgData":1});
res.json(whiteboads[0]);
  } catch (err) {
    res.status(500).send(err);
  }
});
module.exports = app;
