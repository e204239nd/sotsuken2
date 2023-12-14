//グループ図形関係の処理
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
      const frame = group
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

      //グループ図形にマウスイベントを登録する
      groupMouseEvent(group); 

      //コンテキストメニューを閉じる
      const removeMenu = contextMenu.parentNode;
      svg.removeChild(removeMenu); 
      IsClickArray = [];
      groupCnt++;
    });
  });
}

//グループ化された図形のイベント
function groupMouseEvent(group) {
  const drag = (event) => {
    const dx = event.dx;
    const dy = event.dy;
    const elems = group.selectAll(".contentBox");
    
    
    //グループ内のそれぞれの図形に対してドラッグイベントを付与する
    elems.each(function (p, j) {
      const elem = d3.select(this);
      const cx = elem.attr("cx");
      
//グループが移動したときに接続された矢印の始点を合わせてずらす

      //矢印の移動
      if (!elem.select(".arrow_frame").empty()) {
        //枠の移動
        const arrow_frame = elem.select(".arrow_frame");
        arrow_frame
          .attr("x", Number(arrow_frame.attr("x")) + dx)
          .attr("y", Number(arrow_frame.attr("y")) + dy);

        //矢印の移動
        const arrow = elem.select(".arrow");
        const seg = getArrowPos(elem.select(".arrow").attr("d"));
        const x = seg.x + dx;
        const y = seg.y + dy;
        const d = `M ${x} ${y} L ${seg.endX + dx} ${seg.endY + dy}`;
        // console.log(
        //   elem.attr("id")+"\n"+
        //   "seg:" + seg.x + " " + seg.y + " " + seg.endX + " " + seg.endY
        // );
        // console.log("groupMouseEvent");
        // console.log(elem.attr("id") + ":");
        // console.log(seg);
        // console.log(d);
        arrow.attr("d", d);
        // console.log(arrow.attr("d"));
        // console.log(elem.select(".arrow_frame").empty());
        //矢印の枠の移動
      } else if (cx) {
        //円の移動
        elem
          .attr("cx", Number(elem.attr("cx")) + dx)
          .attr("cy", Number(elem.attr("cy")) + dy);
      } else {
        //四角の移動
        elem
          .attr("x", Number(elem.attr("x")) + dx)
          .attr("y", Number(elem.attr("y")) + dy);
      }
    });
    setFrameSize(group);
  };

  //グループをドラッグした時の処理
  group.call(
    d3
      .drag()
      .on("drag", drag)
      .on("end", () => setFrameSize(group))
  );

  
  const frame = group.select(".group_frame");
  //ダブルクリックした時の処理
  group.on("dblclick", () => {
    //グループ化の枠を表示する
    frame.attr("opacity", 0.7);
    group.call(d3.drag().on("drag", drag));
  });

  frame.on("click", (event) => {
    frame.attr("opacity", 0.7);
  });

  //図形の外をクリックした際の処理
  svg.addEventListener("click", (e) => {
    if (e.target.id == "svg") {
      frame.attr("opacity", 0);
      group.call(d3.drag().on("drag", null));
    }
  });
  setFrameSize(group);
  clickEventHundler(group.node());
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


