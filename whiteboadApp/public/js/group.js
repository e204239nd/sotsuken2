/*  
10/26（木）　
・shiftキーを押しながらクリックすることで、グループ化したい図形のIDを追加する処理を追加
・要素が追加・削除された際にグループ化イベントの登録を行うようにする予定

11/05（日）　
・whiteboadAppへグループ化機能を追加
・グループ化する際、グループ化する要素に設定されたドラッグイベントが、グループ化されたオブジェクトのドラッグイベントと同時に動作するため、
グループ化済みの図形が不自然な挙動をする不具合が出た。
・イベントを登録すると動作が非常に重い。snap.svg自身が重たいのでd3.jsを利用してみる
 */

let IsClickArray = [];

document.addEventListener("DOMContentLoaded", function () {
  //クリック状態を初期化
  IsClickArray = [];
  clickEventHundler();
  mutationOberver();
});

function clickEventHundler() {  
  // 外部のSVG要素を取得
  const contentBoxes = document.querySelectorAll(".content");
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
      }
    });
    displayContextMenu(contentBox);
  });
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
    const contextMenu = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    );

    //コンテキストメニューの表示
    const content = document.createElement("div");
    content.innerHTML = `<a class="groupBtn"><button style="background:gray; padding:5px;">グループ化</button></a></ul>`;
    setAttributes(contextMenu, {
      x: px,
      y: py,
      width: 500,
      height: 500,
    });
    contextMenu.appendChild(content);
    svg.appendChild(contextMenu);

    //メニューからグループ化を押したときの処理
    content.addEventListener("click", (e) => {
      const paper = Snap("#svg");
      const group = paper.g();
      //グループ化した図形を枠で囲む
      const rect = paper.rect(0, 30, 150, 250);
      rect.attr({
        class: "group_frame",
        opacity: 0,
        fill: "white",
        strokeWidth: 1,
        stroke: "black",
      });

      group.add(rect);
      //選択した図形をグループに追加する
      for (let i = 0; i < IsClickArray.length; i++) {
        // グループの属性を設定
        group.attr({
          fill: "blue",
          stroke: "black",
          strokeWidth: 2,
          class: "groupObj",
        });

        const targetObj = document.getElementById(IsClickArray[i]);
        const svgObject = Snap(targetObj);
        
        //グループに追加
        group.add(svgObject);
      }

      

      //図形以外の領域をクリックすると編集状態をfalseへ
      paper.click((e) => {
        for (let i = 0; i < IsClickArray.length; i++) {
          if (e.target.id != IsClickArray[i]) continue;
          const div = document.querySelector("#" + IsClickArray[i]);
          div.style.cursor = "default";
        }
        edit = false;
        group.drag();
      });

      //クリックされたときに編集状態に変更
      group.dblclick(() => {
        if (!edit) {
          for (let i = 0; i < IsClickArray.length; i++) {
            if (e.target.id != IsClickArray[i]) continue;
            const div = document.querySelector("#" + IsClickArray[i]);
            div.style.cursor = "auto";
          }
          edit = true;
          group.undrag();
        }
      });

      group.drag();
      //配列を初期化
      IsClickArray = [];
      console.log(contextMenu);
      contextMenu.parentNode.removeChild(contextMenu); //コンテキストメニューを閉じる
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
  const targetNode = document.querySelector("#svg");

  // MutationObserverを生成
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // 子ノードの追加が検出された場合の処理
        clickEventHundler();
      }
      
      if (mutation.type === "childList" && mutation.target.classList == "content") {
        IsClickArray = Array(IsClickArray.length).fill(0);
        console.log("子ノードの削除が検出されました");
      }
    });
  });

  // 監視オプションを設定
  const config = { childList: true };
  console.log(observer);
  // オブザーバをターゲットに適用
  observer.observe(targetNode, config);
}
