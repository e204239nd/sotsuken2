// 描画メニューの切り替え
document.addEventListener("DOMContentLoaded", drawEventHundler);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    drawMode = "";
  }
});

function drawEventHundler() {
  //テキストボックスメニューがドラッグされているとき-
  const imgBox_menu = document.getElementById("imgBox_menu");
  const textBox_menu = document.getElementById("textBox_menu");
  const arrow_menu = document.getElementById("arrow_menu");
  const rect_menu = document.getElementById("rect_menu");
  const circle_menu = document.getElementById("circle_menu");
  imgBox_menu.addEventListener("dragstart", () => (drawMode = "imgbox"));
  imgBox_menu.addEventListener("dragend", displayToImgbox);
  textBox_menu.addEventListener("dragstart", () => (drawMode = "textbox"));
  textBox_menu.addEventListener("dragend", displayToTextbox);
  arrow_menu.addEventListener("click", () => {
    drawMode = "arrow";
    displayToArrow(count);
  });
  rect_menu.addEventListener("dragstart", () => (drawMode = "rect"));
  rect_menu.addEventListener("dragend", displayToRect);
  circle_menu.addEventListener("dragstart", () => (drawMode = "circle"));
  circle_menu.addEventListener("dragend", displayToCircle);
  displayToArrow(count);
  mutationOberver();
  const svg = document.querySelector("#svg");

  svg.addEventListener("click", (e) => {
    //コンテキストメニューを削除する
    // debugFunc(drawMode);
    if (e.target.id == "svg") {
      d3.selectAll(".contextmenu").remove();
    }
  });
  //クリック状態を初期化
  IsClickArray = [];
}
