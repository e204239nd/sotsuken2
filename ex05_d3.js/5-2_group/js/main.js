/*  
10/26（木）　
・shiftキーを押しながらクリックすることで、グループ化したい図形のIDを追加する処理を追加
・要素が追加・削除された際にイベント登録を行うようにする予定
 */

let IsClickArray = [];

document.addEventListener("DOMContentLoaded", function () {
  //クリック状態を初期化
  IsClickArray = [];
  clickEventHundler();
  // const svg = document.querySelector("#svg-container");
  // svg.addEventListener("click", (e) => (IsClickArray = []));
});

function clickEventHundler() {
  // 外部のSVG要素を取得
  const contentBoxes = document.querySelectorAll(".contentBox");
  contentBoxes.forEach((contentBox) => {
    // 外部のSVG要素をSnap.svgに追加
    // const svgObject = Snap(contentBox);
    // group.add(svgObject);

    //クリック時の処理
    contentBox.addEventListener("click", (e) => {
      //シフトキーを押しながらクリックしたときに選択した図形のidを追加する
      if (e.shiftKey && !IsClickArray.includes(contentBox.id)) {
        const num = contentBox.id;
        IsClickArray.push(num);
        debugFunc("shift + 左クリック");
      }
    });
    displayContextMenu(contentBox);
  });

  // 任意のアクションを追加
  /* group.click(function () {
    alert("クリックされました");
  }); */
}

function displayContextMenu(contentBox) {
  //右クリック時の処理
  contentBox.addEventListener("contextmenu", (e) => {
    if (IsClickArray.length <= 1) {
      return;
    }
    // グループ化した図形の枠の要素を取得
    const clientRect = contentBox.getBoundingClientRect();

    // ページの左端から、要素の左端までの距離
    const px = window.scrollX + clientRect.left / 2;

    // ページの上端から、要素の上端までの距離
    const py = window.scrollY + clientRect.top / 2;
    const svg = document.querySelector("#svg");
    const foreignObject = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    );

    //コンテキストメニューの表示
    const contextMenu = document.createElement("div");
    contextMenu.innerHTML = `<a class="groupBtn"><button style="background:gray; padding:5px;">グループ化</button></a></ul>`;
    setAttributes(foreignObject, {
      x: px,
      y: py,
      width: 500,
      height: 500,
    });
    foreignObject.appendChild(contextMenu);
    svg.appendChild(foreignObject);

    //メニューからグループ化を押したときの処理
    contextMenu.addEventListener("click", (e) => {
      const group = d3.select("#svg").append("g");
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 150)
        .attr("height", 250)
        .attr("class", "group_frame")
        .attr("opcity", 0)
        .attr("fill", "white")
        .attr("strokeWidth", 1)
        .attr("stroke", "black");

      //選択した図形をグループに追加する
      for (let i = 0; i < IsClickArray.length; i++) {
        // グループの属性を設定
        group
          .attr("fill", "blue")
          .attr("stroke", "black")
          .attr("strokeWeight", 2)
          .attr("class", "groupObj");
        const clickedElem = d3.select("#" + IsClickArray[i]);
        //グループに追加
        group.append(() => clickedElem.node());
      }
      group.call(
        d3.drag().on("drag", () => {
          for (let i = 0; i < IsClickArray.length; i++) {
            const elem = d3.select("#" + IsClickArray[i]);
            elem
              .attr("x", Number(elem.attr("x")) + Number(d3.event.dx))
              .attr("y", Number(elem.attr("y")) + Number(d3.event.dy));
            console.log(d3.event.x);
          }
        })
      );
      //グループのドラッグ時の処理

      contextMenu.parentNode.removeChild(contextMenu); //コンテキストメニューを閉じる
      debugFunc(IsClickArray);
    });
  });
}

//要素の属性を一括で設定する
// element:属性を指定したい要素 attributes:指定する属性と値をオブジェクト形式で指定（例：{attribute:value}）
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}

// DOMツリーが変更された際の処理
function mutationOberver() {
  // ターゲット要素を取得
  const targetNode = document.getElementById("#svg");

  // MutationObserverを生成
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // 子ノードの追加が検出された場合の処理
        clickEventHundler();
        console.log("子ノードの追加が検出されました");
      }
      if (mutation.type === "childList") {
        IsClickArray = Array(IsClickArray.length).fill(0);
        console.log("子ノードの削除が検出されました");
      }
    });
  });

  // 監視オプションを設定
  const config = { childList: true };

  // オブザーバをターゲットに適用
  observer.observe(targetNode, config);
}

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
  elem.style =
    "background:aliceblue; y:0;width:100vw;height:2rem;font-size:1rem;";
  elem.textContent = str;
  elem.id = "debug";
  document.querySelector("svg").appendChild(elem);
}
