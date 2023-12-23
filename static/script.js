document.addEventListener("DOMContentLoaded", function () {
  var btnshot = document.getElementById("btn-shot");
  var cam = document.querySelector(".cam");
  cam.innerHTML = '<ion-icon name="camera" class="iconcam"></ion-icon>';
  btnshot.style.display = "none";
  const modeBtn = document.getElementById("checkbox");
  modeBtn.onchange = (e) => {
    if (modeBtn.checked === true) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      window.localStorage.setItem("mode", "light");
    }
  };

  const mode = window.localStorage.getItem("mode");
  if (mode == "dark") {
    modeBtn.checked = true;
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }

  if (mode == "light") {
    modeBtn.checked = false;
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }

  //Xử lí form hình ảnh
  const webCamELement = document.getElementById("webCam");
  const canvasELement = document.getElementById("canvas");
  const webcam = new Webcam(webCamELement, "user", canvasELement);
  webcam.start();

  // Hàm chuyển đổi dữ liệu hình ảnh sang Blob
  function dataURLtoBlob(dataURL) {
    let byteString = atob(dataURL.split(",")[1]);
    let mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $("#imagePreview").css(
          "background-image",
          "url(" + e.target.result + ")"
        );
        $("#imagePreview").hide();
        $("#imagePreview").fadeIn(650);
        // Tự động submit form sau khi chọn ảnh
        var form = document.getElementById("autoUploadForm");
        form.submit();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  $(document).ready(function () {
    // Bắt sự kiện thay đổi của input file
    $("#imageUpload").change(function () {
      readURL(this);
    });
  });

  const switchFormLabel = document.querySelector('label[onclick="switchForm"]');
  if (switchFormLabel) {
    switchFormLabel.onclick = switchForm;
  }

  function switchForm() {
    var form1 = document.getElementById("form1");
    var form2 = document.getElementById("form2");
    var ip = document.getElementById("inputFile");
    var btndoan = document.getElementById("btndudoan");
    if (form1.style.display === "none") {
      form1.style.display = "block";
      form2.style.display = "none";
      ip.style.display = "block";
      btndoan.style.display = "block";
      btnshot.style.display = "none";
      cam.innerHTML = '<ion-icon name="camera" class="iconcam"></ion-icon>';
    } else {
      form1.style.display = "none";
      form2.style.display = "block";
      ip.style.display = "none";
      canvasELement.style.display = "none";
      btndoan.style.display = "none";
      btnshot.style.display = "block";
      cam.innerHTML = '<ion-icon name="image" class="iconcam"></ion-icon>';
    }
  }

  const addPTLabel = document.getElementById("btn-shot");
  if (addPTLabel) {
    addPTLabel.addEventListener("click", function (event) {
      event.preventDefault();
      addPT();
    });
  }
  function addPT() {
    // Tạo một FormData mới
    let formData = new FormData();
    // Chụp ảnh mới từ webcam
    let picture = webcam.snap();
    // Lưu data chuyển sang Blob
    formData.append("file", dataURLtoBlob(picture));
    // Tạo một XMLHttpRequest để gửi dữ liệu lên server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    // Đặt callback để xử lý khi yêu cầu hoàn tất
    xhr.onload = function () {
      if (xhr.status === 200) {
        window.location.href = "/upload";
        console.log("Dữ liệu ảnh mới đã được gửi lên thành công.");
      } else {
        console.error("Có lỗi xảy ra khi gửi dữ liệu ảnh.");
      }
    };
    // Gửi dữ liệu
    xhr.send(formData);
    // Reset webcam
    webcam.stop();
    webcam.start();
    // Hiển thị webcam
    var cam = document.getElementById("webCam");
    cam.style.display = "none";
  }
});
