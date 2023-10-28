const mongoose = require("mongoose");

const WhiteboadSchema = new mongoose.Schema({
  boad: {
    type: String,
    required: true,
    trim: true, //空白削除
  },
  });

const Whiteboad = mongoose.model("Whiteboad",WhiteboadSchema);
module.exports = Whiteboad;
