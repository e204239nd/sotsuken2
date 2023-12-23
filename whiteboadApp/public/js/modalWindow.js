//   chatGPT利用
function modalWindow() {
  // モーダルウィンドウの背景を取得
  const modalBg = document.getElementById("modal-bg");
  // モーダルウィンドウの閉じるボタンを取得
  const modalClose = document.getElementById("modal-close");
  // モーダルウィンドウに表示するフォームを取得
  const modalForm = document.getElementById("modal-form");


  // モーダルウィンドウの閉じるボタンにクリックイベントを追加
  modalClose.addEventListener("click", () => {
    // モーダルウィンドウの背景を非表示
    modalBg.style.display = "none";
  });

  // モーダルウィンドウに表示するフォームにサブミットイベントを追加
  modalForm.addEventListener("submit", (event) => {
    // ページ遷移をキャンセル
    event.preventDefault();
    // フォームのデータを取得
    const formData = new FormData(modalForm);
    // フォームの送信先URLを取得
    const url = modalForm.getAttribute("action");
    // フォームの送信オプションを設定
    const options = {
      method: "POST",
      body: formData,
    };
    // フォームを非同期通信で送信
    fetch(url, options)
      .then((response) => {
        // 送信が成功した場合の処理
        console.log(response);
      })
      .catch((error) => {
        // 送信が失敗した場合の処理
        console.error(error);
      });
    // モーダルウィンドウの背景を非表示
    modalBg.style.display = "none";
  });
}