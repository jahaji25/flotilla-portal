
const { createClient } = supabase;

const config = window.SITE_CONFIG;
const db = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

let blocks = [];
let selected = -1;

const canvas = document.getElementById("canvas");
const status = document.getElementById("status");

const defaults = [
  {
    type: "hero",
    title: "Welcome to Commander Flotilla West",
    text: "Add your introduction here.",
    color: "#e6f0f2"
  }
];

function setStatus(message) {
  status.textContent = message;
}

function render() {
  canvas.innerHTML = "";

  blocks.forEach((block, index) => {
    const section = document.createElement("section");
    section.draggable = true;
    section.style.cursor = "grab";
    section.className = "builder-block";
    section.addEventListener("dragstart", (event) => {
  event.dataTransfer.setData("text/plain", String(index));
  event.dataTransfer.effectAllowed = "move";
});

section.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
});

section.addEventListener("drop", (event) => {
  event.preventDefault();

  const fromIndex = Number(
    event.dataTransfer.getData("text/plain")
  );
  const toIndex = index;

  if (
    Number.isInteger(fromIndex) &&
    fromIndex >= 0 &&
    fromIndex < blocks.length &&
    fromIndex !== toIndex
  ) {
    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);

    selected = toIndex;
    render();
    loadEditorFields();
    setStatus("Section moved successfully.");
  }
});

    if (selected === index) {
      section.classList.add("selected");
    }

    section.style.background = block.color || "#ffffff";

    const moveButtons = document.createElement("div");
    moveButtons.style.display = "flex";
    moveButtons.style.gap = "8px";
    moveButtons.style.marginBottom = "10px";

    const upButton = document.createElement("button");
    upButton.textContent = "↑ উপরে";
    upButton.disabled = index === 0;

    upButton.onclick = (event) => {
      event.stopPropagation();

      if (index > 0) {
        [blocks[index - 1], blocks[index]] =
          [blocks[index], blocks[index - 1]];

        selected = index - 1;
        render();
        loadEditorFields();
      }
    };

    const downButton = document.createElement("button");
    downButton.textContent = "↓ নিচে";
    downButton.disabled = index === blocks.length - 1;

    downButton.onclick = (event) => {
      event.stopPropagation();

      if (index < blocks.length - 1) {
        [blocks[index + 1], blocks[index]] =
          [blocks[index], blocks[index + 1]];

        selected = index + 1;
        render();
        loadEditorFields();
      }
    };

    moveButtons.append(upButton, downButton);

    const heading = document.createElement("h2");
    heading.textContent = block.title || "";

    const paragraph = document.createElement("p");
    paragraph.textContent = block.text || "";

    section.append(moveButtons, heading, paragraph);

    section.addEventListener("click", () => {
      selected = index;
      render();
      loadEditorFields();
    });

    canvas.appendChild(section);
  });
}

function makeBlock(type) {
  const presets = {
    hero: {
      title: "Welcome to Commander Flotilla West",
      text: "Add your introduction here.",
      color: "#e6f0f2"
    },
    text: {
      title: "Information Section",
      text: "Write your information here.",
      color: "#ffffff"
    },
    cards: {
      title: "Information Cards",
      text: "Operations | General Information | Ships / Crafts",
      color: "#ffffff"
    },
    image: {
      title: "Image Section",
      text: "Paste an image URL here.",
      color: "#ffffff"
    }
  };

  blocks.push({
    type,
    ...(presets[type] || presets.text)
  });

  selected = blocks.length - 1;
  render();
  loadEditorFields();
}

function loadEditorFields() {
  if (selected < 0 || !blocks[selected]) return;

  document.getElementById("editTitle").value =
    blocks[selected].title || "";

  document.getElementById("editText").value =
    blocks[selected].text || "";

  document.getElementById("editColor").value =
    /^#[0-9a-fA-F]{6}$/.test(blocks[selected].color || "")
      ? blocks[selected].color
      : "#ffffff";
}

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => {
    makeBlock(button.dataset.add);
  });
});

document.getElementById("editTitle").addEventListener("input", event => {
  if (selected < 0 || !blocks[selected]) return;
  blocks[selected].title = event.target.value;
  render();
});

document.getElementById("editText").addEventListener("input", event => {
  if (selected < 0 || !blocks[selected]) return;
  blocks[selected].text = event.target.value;
  render();
});

document.getElementById("editColor").addEventListener("input", event => {
  if (selected < 0 || !blocks[selected]) return;
  blocks[selected].color = event.target.value;
  render();
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (selected < 0) return;

  blocks.splice(selected, 1);
  selected = blocks.length ? Math.min(selected, blocks.length - 1) : -1;

  render();
  loadEditorFields();
  setStatus("Element deleted.");
});

async function checkAdmin() {
  try {
    const { data, error } = await db.auth.getUser();

    if (error || !data.user) {
      setStatus("Please sign in through the Admin Panel first.");
      return false;
    }

    if (
      data.user.email?.toLowerCase() !==
      "sadeek1125.2@gmail.com"
    ) {
      setStatus("This account is not authorized to edit the site.");
      return false;
    }

    return true;
  } catch (error) {
    setStatus("Could not verify login: " + error.message);
    return false;
  }
}

async function saveContent(table) {
  if (!(await checkAdmin())) return;

  setStatus("Saving...");

  const payload = {
    id: "homepage",
    html_content: JSON.stringify({
      version: 1,
      blocks
    }),
    css_content: ""
  };

  try {
    const { error } = await db
      .from(table)
      .upsert(payload, { onConflict: "id" });

    if (error) {
      setStatus("Save failed: " + error.message);
      return;
    }

    setStatus(
      table === "site_builder_drafts"
        ? "Draft saved successfully."
        : "Published content saved to Supabase."
    );
  } catch (error) {
    setStatus("Save failed: " + error.message);
  }
}

async function loadDraft() {
  setStatus("Checking admin login...");

  try {
    if (!(await checkAdmin())) return;

    setStatus("Loading saved draft...");

    const { data, error } = await db
      .from("site_builder_drafts")
      .select("html_content")
      .eq("id", "homepage")
      .maybeSingle();

    if (error) {
      setStatus("Could not load draft: " + error.message);
      blocks = defaults.map(block => ({ ...block }));
    } else if (data?.html_content) {
      try {
        const saved = JSON.parse(data.html_content);

        blocks = Array.isArray(saved.blocks)
          ? saved.blocks
          : defaults.map(block => ({ ...block }));
      } catch {
        blocks = defaults.map(block => ({ ...block }));
      }
    } else {
      blocks = defaults.map(block => ({ ...block }));
    }

    selected = blocks.length ? 0 : -1;
    render();
    loadEditorFields();
    setStatus("Ready to edit.");
  } catch (error) {
    blocks = defaults.map(block => ({ ...block }));
    selected = 0;
    render();
    loadEditorFields();
    setStatus("Loading failed: " + error.message);
  }
}

document.getElementById("previewBtn").addEventListener("click", () => {
  const preview = window.open("", "_blank");

  if (!preview) {
    setStatus("Allow pop-ups to open preview.");
    return;
  }

  const sections = blocks.map(block => `
    <section style="padding:28px;margin:12px 0;background:${escapeHTML(block.color || "#ffffff")};border-radius:10px">
      <h2>${escapeHTML(block.title || "")}</h2>
      <p>${escapeHTML(block.text || "")}</p>
    </section>
  `).join("");

  preview.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Website Preview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: auto;
            padding: 16px;
            color: #172a36;
          }
          p {
            line-height: 1.7;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>${sections}</body>
    </html>
  `);

  preview.document.close();
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.getElementById("saveBtn").addEventListener("click", () => {
  saveContent("site_builder_drafts");
});

document.getElementById("publishBtn").addEventListener("click", async () => {
  if (!confirm("Publish this design to the published-content table?")) {
    return;
  }

  await saveContent("site_builder_published");
});

loadDraft();
