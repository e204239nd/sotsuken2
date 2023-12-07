//選択図形を格納する配列
let IsClickArray;
let groupCnt = 0;

//コンテキストメニューの表示
function displayContextMenu(contentBox) {
  //右クリック時の処理
  contentBox.addEventListener("contextmenu", (e) => {
    if (IsClickArray.length <= 1) return;
    // グループ図形の枠の大きさを取得
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
      id: "contextMenu",
      x: px,
      y: py,
      width: 100,
      height: 100,
    });
    foreignObject.appendChild(contextMenu);
    svg.appendChild(foreignObject);

    //メニューをクリックしたときの処理
    contextMenu.addEventListener("click", (e) => {
      e.stopPropagation(); //親要素のイベントを実行しないようにする
      const group = d3
        .select("#svg")
        .append("g")
        .attr("style", "blue")
        .attr("stroke", "black")
        .attr("strokeWeight", 2)
        .attr("id", "groupObj" + groupCnt)
        .attr("class", "groupObj contentBox");

      //グループを囲むフレーム（枠）の追加
      group
        .append("rect")
        .attr("class", "group_frame")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", "white")
        .attr("opacity", 0.7)
        .attr("strokeWidth", 1)
        .attr("stroke", "black");

      //選択した図形をグループに追加する
      for (let i = 0; i < IsClickArray.length; i++) {
        const clickedElem = d3.select("#" + IsClickArray[i]);
        //グループに追加
        group.append(() => clickedElem.node());
      }

      //フレームの大きさを調整する
      setFrameSize(group);
      const drag = (event, d) => {
        const dx = event.dx;
        const dy = event.dy;
        const elems = group.selectAll("*");
        elems.each(function (p, j) {
          const elem = d3.select(this);
          /* if (elem.attr("class") == "arrow") {
            console.log(elem.attr("d"));
          } */
          elem
            .attr("x", Number(elem.attr("x")) + dx)
            .attr("y", Number(elem.attr("y")) + dy);
        });
      };

      //グループをドラッグした時の処理
      group.call(d3.drag().on("drag", drag));

      const frame = group.select(".group_frame");
      //ダブルクリックした時の処理
      group.on("dblclick", () => {
        //グループ化の枠を表示する
        frame.attr("opacity", 0.7);
        group.call(d3.drag().on("drag", drag));
      });

      

      frame.on("click", (event, d) => {
        debugFunc("クリック");
        frame.attr("opacity", 0.7);
      });

      //削除するコンテキストメニュー
      const removeMenu = contextMenu.parentNode;

      //図形の外をクリックした際の処理
      svg.addEventListener("click", (e) => {
        if (e.target.id == "svg") {
          frame.attr("opacity", 0);
          group.call(d3.drag().on("drag", null));
        }
      });

      clickEventHundler(group.node());
      svg.removeChild(removeMenu); //コンテキストメニューを閉じる
      IsClickArray = [];
      groupCnt++;
      console.log(IsClickArray);
    });
  });
}

// 図形クリック時の処理
function clickEventHundler(contentBoxes) {
  for (let i = 0; i < contentBoxes.length; i++) {
    let contentBox = contentBoxes[i];

    contentBox.addEventListener("click", (e) => {
      // グループ化した図形は追加しない
      if (contentBox.parentNode.classList[0] == "groupObj") return;

      //シフトキーを押していて、isclickArrayに図形のidが含まれていなければ
      if (e.shiftKey && !IsClickArray.includes(contentBox.id)) {
        if (contentBox.classList[0] == "groupObj") {
          const frame = contentBox.querySelector(".group_frame");
          frame.setAttribute("opacity", 0.7);
        }

        // 図形のidをisClickArrayに追加する
        IsClickArray.push(contentBox.id);
      }
      // debugFunc(IsClickArray);
    });
    //コンテキストメニューの表示
    displayContextMenu(contentBox);
  }
}

// グループ図形の枠のサイズを変更する
function setFrameSize(group) {
  // グループの始点と終点を設定する
  const frame = group.select(".group_frame");
  console.log(frame.node());
  const r = frame.node().parentNode.getBoundingClientRect();
  const margin = 10;
  const frameX = r.x;
  const frameY = r.y;
  const frameW = r.width;
  const frameH = r.height;
  //フレームの上下左右の余白
  
  frame
    .attr("x", frameX )
    .attr("y", frameY )
    .attr("width", frameW)
    .attr("height", frameH);
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
  debugTxt.textContent = str;
}
