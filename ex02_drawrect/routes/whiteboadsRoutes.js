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

/* データの作成 */
app.post("/whiteboad", async (req, res) => {
  const whiteboad = new whiteboadModel(req.body);
  try {
    await whiteboad.save();
    res.send(whiteboad);
  } catch (err) {
    res.status(500).send(err);
  }
});

/* データの部分修正 */
app.patch("/whiteboad/:id", async (req, res) => {
  try {
    await whiteboadModel.findByIdAndUpdate(req.params.id,req.body);
    await whiteboadModel.save();
    res.send(whiteboad);
  } catch (err) {
    res.status(500).send(err);
  }
});

/* データの削除 */
app.patch("/whiteboad/:id", async (req, res) => {
  try {
    await whiteboadModel.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = app;
