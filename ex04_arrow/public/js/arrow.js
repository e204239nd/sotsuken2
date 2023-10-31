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
  document.querySelector("svg").appendChild(elem);
}


function arrow() {
    let mode = "arrow";  
  const svg = document.querySelector("#svg-container");
  let segs = [];
  let px, py;
  let arrow;
  let tmp;

  svg.addEventListener("mousedown", (e) => {
    if (mode != "arrow") {
        if(e.shiftkey) {
            mode = "arrow";
            debugFunc(mode);
        }
        return false;
      }
    const clientRect = e.target.getBoundingClientRect();
    // ページの左端から、要素の左端までの距離
    px = e.offsetX;
    // ページの上端から、要素の上端までの距離
    py = e.offsetY;

    const paper = Snap("#svg-container");
    segs = [
      ["M", px, py],
      ["L", px+1, py],
    ];
    tmpX = px;
    tmpY = py;
    //   debugFunc("x:" + px + " y:" + py);
    //矢印の描画
    //バグ: 描画した直後の矢印はドラッグ判定にならない
    arrow = paper.path(segs);
    arrow.drag();
    arrow.attr({ stroke: "red", strokeWidth: 10 });
    arrow.drag((dx, dy) => {
      px = tmpX + dx;
      py = tmpY + dy;
      arrow.attr({ x: px, y: py });
      debugFunc(px + " " + py);
    });
    mode=false;
  });
}

document.addEventListener("DOMContentLoaded", arrow);
