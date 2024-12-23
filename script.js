const actions = {
  toggleNoteSafeDelete: () => {
    noteSafeDelete = !noteSafeDelete;
    setStorageItem("quickNotes-safeDelete", noteSafeDelete);
    document.getElementById("toggle-safe-delete").checked = noteSafeDelete;
  },
  createNote: () => {
    const note = {
      id: `note-${Date.now()}`,
      color: randomColor(),
      title: "",
      content: "",
      date: formatDate(new Date()),
    };

    const notes = getStoredNotes();
    console.log(notes);
    notes.push(note);
    setStorageItem("quickNotes-notes", notes);
    actions.editNote(appendNoteElement(note));
  },
  editNote: element => {
    resetAllNotesState();

    element.toggleAttribute("editing");
    element.querySelector("h2").toggleAttribute("contenteditable");
    element.querySelector("p").toggleAttribute("contenteditable");
    element.querySelector("h2").focus();
  },
  toggleNotePalette: element => element.toggleAttribute("palette"),
  changeNoteColor: (element, button) => (element.className = `note ${button.getAttribute("option")}`),
  openNotePopover: element => {
    if (!noteSafeDelete) return actions.deleteNote(element);
    element.removeAttribute("palette");
    element.toggleAttribute("popover", true);
  },
  disableNoteSafeDelete: (element, status) => {
    element.querySelector(".delete button:last-child").disabled = status;
  },
  closeNotePopover: element => element.removeAttribute("popover"),
  deleteNote: element => {
    if (element.querySelector(".delete input").checked) {
      noteSafeDelete = true;
      actions.toggleNoteSafeDelete();
    }

    const notes = getStoredNotes();
    const filteredNotes = notes.filter(note => note.id !== element.id);
    setStorageItem("quickNotes-notes", filteredNotes);
    element.remove();
  },
  saveNote: element => {
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === element.id);

    Object.assign(note, {
      title: element.querySelector("h2").innerText.trim(),
      content: element.querySelector("p").innerText.trim(),
      date: formatDate(new Date()),
      color: Array.from(element.classList).find(cls => colors.includes(cls)) || "purple",
    });

    setStorageItem("quickNotes-notes", notes);
    resetNoteState(element, note);
  },
};

let noteSafeDelete = getStorageItem("quickNotes-safeDelete", true);

const getStoredNotes = () => getStorageItem("quickNotes-notes", []);
const colors = ["purple", "blue", "green", "orange", "yellow"];

const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

const formatDate = date => {
  const day = date.getDate();
  const monthShort = date.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  const year = date.getFullYear();

  return `${day} de ${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}, ${year}`;
};

function getStorageItem(key, fallback) {
  return JSON.parse(localStorage.getItem(key)) ?? fallback;
}

function setStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function resetNoteState(element, note) {
  element.className = `note ${note.color}`;

  element.querySelector("h2").removeAttribute("contenteditable");
  element.querySelector("p").removeAttribute("contenteditable");

  element.querySelector("h2").innerText = note.title;
  element.querySelector("p").innerText = note.content;

  element.removeAttribute("popover");
  element.removeAttribute("palette");
  element.removeAttribute("editing");

  element.querySelector(".delete input").checked = false;
  element.querySelector(".delete button:last-child").disabled = false;
}

function resetAllNotesState() {
  const notes = getStoredNotes();
  document.querySelectorAll(".note[editing], .note[palette], .note[popover]").forEach(element => {
    const note = notes.find(n => n.id === element.id);
    if (note) resetNoteState(element, note);
  });
}

function appendNoteElement(note) {
  const template = document.getElementById("note-template").content.cloneNode(true);
  const element = template.querySelector("li");

  element.id = note.id;
  element.className = `note ${note.color}`;
  element.querySelector("h2").textContent = note.title;
  element.querySelector("p").textContent = note.content;
  element.querySelector(".footer span").textContent = note.date;
  element.querySelector(".delete input").id = "ask-" + note.id;
  element.querySelector(".delete label").htmlFor = "ask-" + note.id;

  document.getElementById("notes").appendChild(template);

  return document.getElementById(note.id);
}

// Update DOM elements
document.getElementById("toggle-safe-delete").checked = noteSafeDelete;
getStoredNotes().forEach(appendNoteElement);

// Event Listeners
document.addEventListener("change", e => {
  const action = e.target.getAttribute("action");
  if (action && actions[action]) {
    actions[action](e.target.closest(".note"), e.target.checked);
  }
});

document.addEventListener("click", e => {
  const button = e.target.closest("button[action]");
  if (button) {
    console.log(button);
    const action = button.getAttribute("action");
    actions[action]?.(button.closest(".note"), button);
  }
});
document.addEventListener("input", e => {
  if (e.target.tagName === "H2" || e.target.tagName === "P") {
    let text = e.target.innerHTML.trim();
    if (text === "<br>" || text === "<div><br></div>") {
      e.target.innerHTML = "";
    }
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const popoverNote = document.querySelector(".note[popover]");
    if (popoverNote) return popoverNote.removeAttribute("popover");

    const paletteNote = document.querySelector(".note[palette]");
    if (paletteNote) return paletteNote.removeAttribute("palette");

    const editingNote = document.querySelector(".note[editing]");
    if (editingNote) return resetAllNotesState();
  }
});
