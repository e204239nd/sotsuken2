let count = 0;
const mySvg = document.getElementById("svg");
const textBox_menu = document.getElementById("textBox_menu");
const imgBox_menu = document.getElementById("imgBox_menu");
const updateBtn = document.getElementById("update");

//テキストボックスメニューがドラッグされているとき
//  draggableで要素のドラッグを可能にしないとdragイベントが使えない
// textBox_menu.addEventListener("dragend", displayToTextbox);
imgBox_menu.addEventListener("dragend", displayToImgbox);


//テキストボックスを表示する
function displayToTextbox(e) {
  console.log(e);
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const r = mySvg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  const textarea = document.createElement("textarea");
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  textarea.setAttribute("placeholder", "文字を入力してください");
  foreignObject.appendChild(textarea);
  mySvg.appendChild(foreignObject);
  count++;
}

//画像を挿入するためのボックスを表示する
function displayToImgbox(e) {
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const div = document.createElement("div");
  const r = mySvg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  const form = document.createElement("form");
  const input = document.createElement("input");
  div.innerHTML = `<form id="form${count}">
  <input id="input${count}" type="file" style="margin-bottom:15px;  accept="image/*"></input>
  <input type="submit"></input>
</form>`;

  setAttributes(div, { id: "contentBox" });
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  foreignObject.appendChild(div);
  mySvg.appendChild(foreignObject);
  //画像ファイルをアップロードしたときの処理
  const formRef = document.querySelector(`#form${count}`);
  const inputRef = document.querySelector(`#input${count}`);
  const submitHundler = async (e) => {
    e.preventDefault();
    const file = inputRef.files[0];
    const formData = new FormData();
    formData.append("img", file);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    // サーバからのレスポンスをJSONとしてパース
    const data = await response.json();

    // アップロード成功のメッセージをアラートで表示
    alert("画像をアップロードしました");

    //画像の挿入
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setAttributes(image, {
      id: "contentBox" + count,
      href: data.imagePath,
      x: x,
      y: y,
    });
    mySvg.removeChild(foreignObject);
    mySvg.appendChild(image);
    count++;
  };
  formRef.addEventListener("submit", submitHundler);

  count++;
}

//要素の属性を一括で設定する
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}
