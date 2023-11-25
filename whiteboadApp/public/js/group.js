//選択図形を格納する配列
let IsClickArray;

document.addEventListener("DOMContentLoaded", function () {
  //クリック状態を初期化
  IsClickArray = [];
  mutationOberver();
});

function clickEventHundler(contentBoxes) {
  for (let i = 0; i < contentBoxes.length; i++) {
    const contentBox = contentBoxes[i];
    if (contentBox.classList[0] != "contentBox") {
      continue;
    }
    //クリック時の処理
    contentBox.addEventListener("click", (e) => {
      //シフトキー＋クリックした時
      if (e.shiftKey && !IsClickArray.includes(contentBox.id)) {
        const num = contentBox.id;
        // 選択図形としてisClickArrayに追加
        IsClickArray.push(num);
      }
    });
    //コンテキストメニューの表示
    displayContextMenu(contentBox);
  }
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
      width: 100,
      height: 100,
    });
    foreignObject.appendChild(contextMenu);
    svg.appendChild(foreignObject);

    //メニューのグループ化を選択した際の処理
    contextMenu.addEventListener("click", (e) => {
      const group = d3
        .select("#svg")
        .append("g")
        .attr("style", "blue")
        .attr("stroke", "black")
        .attr("strokeWeight", 2)
        .attr("class", "groupObj");

      //グループを囲むフレーム（枠）の追加
      group
        .append("rect")
        .attr("class", "group_frame")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0)
        .attr("opcity", 0)
        .attr("fill", "white")
        .attr("opacity", 0.7)
        .attr("strokeWidth", 1)
        .attr("stroke", "black");

      //選択した図形をグループに追加する
      for (let i = 0; i < IsClickArray.length; i++) {
        console.log(IsClickArray);
        const clickedElem = d3.select("#" + IsClickArray[i]);

        //グループに追加
        group.append(() => clickedElem.node());
      }

      //フレームの大きさを調整する

      // グループの始点と終点を設定する
      const contentBox = group.select(".contentBox");
      const frame = group.select(".group_frame");
      const r = contentBox.node().parentNode.getBoundingClientRect();
      console.log(r);
      const frameX = r.x;
      const frameY = r.y;
      const frameW = r.width;
      const frameH = r.height;

      
      //フレームの上下左右の余白
      const margin = 10;
      frame
        .attr("x", frameX-margin*2)
        .attr("y", frameY-margin)
        .attr("width", frameW+margin*2)
        .attr("height", frameH+margin*2);

      //グループのドラッグ時の処理
      group.call(
        d3
          .drag()
          .on("start", () => frame.attr("style", "display:block"))
          .on("drag", (event, d) => {
            const dx = event.dx;
            const dy = event.dy;
            frame
              .attr("x", Number(frame.attr("x")) + dx)
              .attr("y", Number(frame.attr("y")) + dy);

            const elems = group.selectAll(".contentBox");
            elems.each(function (p, j) {
              const elem = d3.select(this);
              elem
                .attr("x", Number(elem.attr("x")) + dx)
                .attr("y", Number(elem.attr("y")) + dy);
            });
          })
      );

      //他をクリックした際に非表示にする
      document
        .querySelector("#svg")
        .addEventListener("click", () => frame.attr("style"));

      contextMenu.parentNode.parentNode.removeChild(contextMenu.parentNode); //コンテキストメニューを閉じる

      IsClickArray = [];
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
  const targetNode = document.getElementById("svg");

  // MutationObserverを生成
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // 子ノードの追加が検出された場合の処理
        clickEventHundler(mutation.addedNodes);
        console.log("子ノードの追加が検出されました");
      } else if (mutation.type === "childList") {
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
