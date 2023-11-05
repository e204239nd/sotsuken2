// デバッグ画面を表示
function debugFunc(str) {
  const debugTxt = document.querySelector("#debug");
  if (debugTxt) {
    debugTxt.textContent = str;
    return;
  }

  const elem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  elem.style = "position:fixed;background:aliceblue; y:0;width:500px;";
  elem.textContent = str;
  elem.id = "debug";
}
let tmpX, tmpY;
function arrow() {
  drawMode = "arrow";
  const svg = document.querySelector("#svg-container");
  let segs = [];
  let px, py;
  let arrow;
  let tmp;
  let arrow_endX, arrow_endY;
  svg.addEventListener("mousedown", (e) => {
    if (mode != "arrow") {
      //   debugFunc(mode);
      return false;
    }
    const clientRect = e.target.getBoundingClientRect();
    // ページの左端から、要素の左端までの距離
    px = e.offsetX;
    // ページの上端から、要素の上端までの距離
    py = e.offsetY;

    const paper = Snap("#svg-container");
    arrow_endX = px + 1;
    arrow_endY = py;
    segs = [
      ["M", px, py],
      ["L", arrow_endX, arrow_endY],
    ];

    //   debugFunc("x:" + px + " y:" + py);
    //矢印の描画

    var moveFlag = false;
    var arrow;
    let tmpX, tmpY;
    // マウスダウンイベント
    paper.mousedown(function (e) {
      moveFlag = true;
      tmpX = e.offsetX;
      tmpY = e.offsetY;
      arrow = paper.path("M " + e.offsetX + " " + e.offsetY);
      paper.attr({ stroke: "black", strokeWeight: 1, id: "arrow" });
      // debugFunc("マウスダウン");
    });

    // マウスムーブイベント
    paper.mousemove(function (e) {
      if (moveFlag) {
        var d = "M " + tmpX + " " + tmpY + " L " + e.offsetX + " " + e.offsetY;
        arrow.attr({ d: d });
        const arrowElem = document.querySelector("#arrow");
        arrowElem.setAttribute("marker-end", "url(#m_atr)");
      }
      // debugFunc("マウスムーブ");
    });

    // マウスアップイベント
    paper.mouseup(function () {
      moveFlag = false;
      // debugFunc("マウスアップ");
    });

    mode = "";
  });
}
