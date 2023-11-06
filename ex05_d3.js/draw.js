const debug = document.querySelector("p");

// SVG要素を作成
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", 500)
  .attr("height", 500);

// 円要素を追加
var circle = svg
  .append("circle")
  .attr("id", "content")
  .attr("cx", 100) // 中心のx座標
  .attr("cy", 100) // 中心のy座標
  .attr("r", 50) // 半径
  .attr("fill", "red"); // 塗りつぶし色
console.log(circle.id);
let editable = false;
// ドラッグの動作を定義
var drag = d3.drag().on("drag", function (d) {
  debug.textContent = editable;
  if (!editable) return;
  // ドラッグ中に円の中心座標を更新
  d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
});

// 円要素にドラッグの動作を適用
circle.call(drag);
circle.on("dblclick", (e) => {
  debug.textContent = "ダブルクリック";
  editable = true;
});

 circle.on("click",()=> {
  d3.event.stopPropagation();
 });

svg.on("click", (d) => {
  debug.textContent = "svgクリック";
  console.log(d);
  editable = false;
});

//   circle.call(undrag);