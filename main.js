var fileToRead = document.getElementById("yourFile");

const main = document.getElementById('main');

function view() {
  const id = `view-frame`;
  // create a label
  const label = document.createElement('label');
  label.setAttribute("for", id);
  
  // create a checkbox
  const checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.name = "view";
  checkbox.value = "View Frame";
  checkbox.id = id;
 
  // place the checkbox inside a label
  label.appendChild(checkbox);
  // create text node
  label.appendChild(document.createTextNode("View Frame"));
  
  checkbox.addEventListener("click", () => {
    var checked = checkbox.checked;
    let frame = document.getElementById("frame");
    frame.style.visibility = checked ? "visible" : "hidden" 
  })
  // add the label to the root
  document.getElementById("main").appendChild(label);
}

function prepareFrame(srcdoc) {
  var ifrm = document.createElement("iframe");
  ifrm.setAttribute("id", "frame");
  ifrm.setAttribute("srcdoc", srcdoc);
  ifrm.style.visibility = "hidden";
  document.body.appendChild(ifrm);
  view();
  return ifrm
  
}

function showRunButton() {
  const button = document.getElementById("run")
  button.addEventListener("click", () => {
    manageImages();
    showSaveButton();
  })
  button.hidden = false;
}

function showSaveButton() {
  const run = document.getElementById("run")
  run.hidden = true;
  const save = document.getElementById("save")
  save.addEventListener("click", downloadHTML)
  save.hidden = false;
}

function frameImages() {
  const frame = document.getElementById('frame')
  const doc = frame.contentWindow.document
  // console.log(frame.contentWindow)
  return doc.images
}


fileToRead.addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
  const file = event.target.files[0];
  
  // Validate file existence and type
  if (!file) {
    showMessage("No file selected. Please choose a file.", "error");
    return;
  }
  
  if (!file.type.startsWith("text")) {
    showMessage("Unsupported file type. Please select a text file.", "error");
    return;
  }
  
  // Read the file
  const reader = new FileReader();
  reader.onload = () => {
    const frame = prepareFrame(reader.result);
    console.log("prepareFrame")
    // wait()
    // const images = frameImages();
    // console.log(images.length)
    // manageImages(images);
    showRunButton()
  };
  reader.onerror = () => {
    showMessage("Error reading the file. Please try again.", "error");
  };
  reader.readAsText(file);
}

function getWayback(original) {
  let available = `http://archive.org/wayback/available?url=${original}`;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", available, false);
  xhr.send();
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = JSON.parse(xhr.response);
    if (Object.keys(data.archived_snapshots).length) {
      let closest = data.archived_snapshots.closest;
      return closest;
    } else {
      const url = new URL(original);
      if (url.hash != "" || url.search != "") {
        url.hash = url.search = ""
        return getWayback(`${url.href}*`);
      }
      return
    }
  } else {
    console.log(`${original}`);
    console.log(`Error: ${xhr.status}`);
    return;
  }
}

const noUI = (closest) => closest.url.replace(closest.timestamp, `${closest.timestamp}if_`);

function getWaybackURL(original) {
  let wayback = getWayback(original);
  if (wayback != undefined) {
    return noUI(wayback)
  }
  return original
}

function getArchived(img) {
  var url = img.src;
  if (url == "") {
    console.log(img)
    return
  }
  let wayback = getWaybackURL(url);
  img.src = wayback;
  console.log(img)
}

function manageImages() {
  const images = frameImages();
  console.log(images.length)
  // let i = 0;
  for (let image of images) {
    // if (i >= 3) break;
    getArchived(image);
    // console.log("getArchived");
    // wait(2);
    // i++;
  }
  console.log("manageImages")
}

function wait(sec) {
  setTimeout(() => {
    console.log(`Delayed for ${sec} second${ sec != 1 ? "s" : ""}.`);
  }, 1000 * sec);
}

function getHTML() {
  var s = new XMLSerializer();
  let frame = document.getElementById("frame");
  const doc = frame.contentWindow.document;
  var str = s.serializeToString(doc);
  return str;
}

function downloadHTML() {
  const content = getHTML();
  // Create element with <a> tag
  const link = document.createElement("a");
  
  // Create a blog object with the file content which you want to add to the file
  const file = new Blob([content], { type: 'text/html' });
  
  // Add file content in the object URL
  link.href = URL.createObjectURL(file);
  
  // Add file name
  link.download = `waybacked-${fileToRead.files[0].name}`;
  
  // Add click event to <a> tag to save file.
  link.click();
  URL.revokeObjectURL(link.href);
}
