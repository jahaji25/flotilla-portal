
let blocks = [];
let selected = -1;

const canvas = document.getElementById("canvas");
const status = document.getElementById("status");

function makeBlock(type) {
  const presets = {
    hero: {
      title: "Welcome to Commander Flotilla West",
      text: "Add your introduction here.",
      color: "#e6f0f2"
    },
    text: {
      title: "New information section",
      text: "Write your information here.",
      color: "#ffffff"
    },
    cards: {
      title: "Information cards",
      text: "Operations | General Information | Ships / Crafts",
      color: "#ffffff"
    },
    image: {
      title: "Image section",
      text: "Paste an image URL in the text field.",
      color: "#ffffff"
    }
  };

  blocks.push({
    type,
    ...(presets[type] || presets.text)
  });

  selected = blocks.length - 1;
  render();
}

function render() {
  canvas.innerHTML = "";

  blocks.forEach((block, index) => {
    const section = document.createElement("section");
    section.className = "builder-block";
    if (selected === index) section.classList.add("selected");

    section.style.background = block.color;

    const heading = document.createElement("h2");
    heading.textContent = block.title;

    const paragraph = document.createElement("p");
    paragraph.textContent = block.text;

    section.append(heading, paragraph);

    section.addEventListener("click", () => {
      selected = index;
      document.getElementById("editTitle").value = block.title;
      document.getElementById("editText").value = block.text;
      document.getElementById("editColor").value = block.color;
      render();
    });

    canvas.appendChild(section);
  });
}

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => {
    makeBlock(button.dataset.add);
  });
});

document.getElementById("editTitle").addEventListener("input", event => {
  if (selected < 0) return;
  blocks[selected].title = event.target.value;
  render();
});

document.getElementById("editText").addEventListener("input", event => {
  if (selected < 0) return;
  blocks[selected].text = event.target.value;
  render();
});

document.getElementById("editColor").addEventListener("input", event => {
  if (selected < 0) return;
  blocks[selected].color = event.target.value;
  render();
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (selected < 0) return;
  blocks.splice(selected, 1);
  selected = -1;
  render();
});

document.getElementById("previewBtn").addEventListener("click", () => {
  alert("Preview: check the current design in the editor.");
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const data = JSON.stringify(blocks);
  const file = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "flotilla-draft.json";
  link.click();
  URL.revokeObjectURL(link.href);
  status.textContent = "Draft downloaded to your device.";
});

document.getElementById("publishBtn").addEventListener("click", () => {
  alert("This starter editor does not publish to the live website yet.");
});

makeBlock("hero");
