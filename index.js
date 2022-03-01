const dropZone = document.querySelector(".drop-zone");
const browserBtn = document.querySelector(".browserBtn");
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector(".progress-container");
const bgprogresss = document.querySelector(".bg-progress");
const progresssBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailFrom");

const toast = document.querySelector(".toast");

const host = "https://innshare.herokuapp.com/";
const uploadUrl = `${host}api/files`;
const emailUrl = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;
const resetFileInput = () => {
  fileInput.value = "";
};
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();

  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged"); //////add drag css action////
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged"); /////remove drag the action///
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log("------", files);

  if (files[0].length) {
    fileInput.files = files;
    uploadFile();
  }

  /////remove drag the action///
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

////add file ///

browserBtn.addEventListener("click", () => {
  fileInput.click();
});
copyBtn.addEventListener("click", () => {
  fileURLInput.select();
  document.execCommand("copy");
  showToast("link copied");
});

const uploadFile = () => {
  if (fileInput.length > 1) {
    showToast("Only upload small fill");
    return;
  }
  files = fileInput.files;
  console.log("--files", files);
  const fileSize = fileInput.files[0];

  if (fileSize > maxAllowedSize) {
    showToast("cannot upload more than 100 mb file ");
    resetFileInput();
    return;
  }

  progressContainer.style.diaplay = "block";

  const formData = new FormData();
  formData.append("myfile", fileInput.files[0]);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      showLink(JSON?.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.upload.onerror = () => {
    showToast(`Error in upload: ${xhr.status}.`);
    resetFileInput();
  };

  xhr.open("POST", uploadUrl);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = Math.round(e.loaded / e.total) * 100;
  // console.log(percent);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progresssBar.style.transform = `scaleX(${percent / 100})`;
};

const showLink = (url) => {
  console.log("--url", url?.file);
  fileInput.value = "";
  emailForm[2].removeAttribute("disabled ");
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURLInput.value = url?.file;
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submit From");
  const url = fileURLInput.value;

  const fromData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elemnts["to - email"].value,
    emailForm: emailForm.elemnts["from-emeil"].value,
  };

  emailForm[2].setAttribute("disabled ", "true");
  console.table(fromData);

  fetch(emailUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fromData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email sent");
        sharingContainer.style.display = "none";
      }
    });
});

let toastTimer;

const showToast = (msg) => {
  toast.innerText = msg;
  // toastTimer.classList.add("show");
  //
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    // toast.classList.remove("show");
    toast.style.transform = "translateY(-50% , 60px)";
  }, 2000);
};
