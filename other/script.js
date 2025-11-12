
const getUsers = () => JSON.parse(localStorage.getItem('noter_users') || '{}');
const setUsers = (u) => localStorage.setItem('noter_users', JSON.stringify(u));

const getNotesKey = (username) => `noter_notes_${username}`;
const getNotes = (username) => JSON.parse(localStorage.getItem(getNotesKey(username)) || '[]');
const setNotes = (username, notes) => localStorage.setItem(getNotesKey(username), JSON.stringify(notes));

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authForm = document.getElementById('authForm');
const loggedInBox = document.getElementById('loggedIn');
const whoEl = document.getElementById('who');

const newNoteToggle = document.getElementById('newNoteToggle');
const noteForm = document.getElementById('noteForm');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteDate = document.getElementById('noteDate');
const notesList = document.getElementById('notesList');
const notesCount = document.getElementById('notesCount');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');

let activeUser = localStorage.getItem('noter_active') || null;
let editingId = null;


function init(){
  if(activeUser){ showLoggedInUI(activeUser); }
  renderNotes();
}

signupBtn.addEventListener('click', ()=>{
  const u = usernameInput.value.trim();
  const p = passwordInput.value.trim();
  if(!u || !p){ alert('Enter username and password'); return; }

  const users = getUsers();
  if(users[u]){ alert('User already exists'); return; }

  users[u] = {password: p};
  setUsers(users);
  localStorage.setItem('noter_active', u);
  activeUser = u;
  setNotes(u, []);
  showLoggedInUI(u);
  renderNotes();
});

loginBtn.addEventListener('click', ()=>{
  const u = usernameInput.value.trim();
  const p = passwordInput.value.trim();
  if(!u || !p){ alert('Enter username and password'); return; }

  const users = getUsers();
  if(!users[u] || users[u].password !== p){ alert('Invalid credentials'); return; }

  localStorage.setItem('noter_active', u);
  activeUser = u;
  showLoggedInUI(u);
  renderNotes();
});

logoutBtn.addEventListener('click', ()=>{
  localStorage.removeItem('noter_active');
  activeUser = null;
  authForm.style.display = '';
  loggedInBox.classList.add('hidden');
  usernameInput.value = '';
  passwordInput.value = '';
  renderNotes();
});

function showLoggedInUI(username){
  authForm.style.display = 'none';
  loggedInBox.classList.remove('hidden');
  whoEl.textContent = username;
}


newNoteToggle.addEventListener('click', ()=>{
  if(!activeUser){ alert('Please login first'); return; }
  toggleNoteForm(true);
});
cancelNoteBtn.addEventListener('click', ()=>{ toggleNoteForm(false); });

function toggleNoteForm(open){
  if(open){
    noteForm.classList.remove('hidden');
    noteDate.value = new Date().toISOString().slice(0,10);
    noteTitle.focus();
  } else {
    noteForm.classList.add('hidden');
    noteTitle.value = noteContent.value = noteDate.value = '';
    editingId = null;
  }
}

saveNoteBtn.addEventListener('click', ()=>{
  if(!activeUser){ alert('Login to save notes'); return; }
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const date = noteDate.value.trim();
  if(!title && !content){ alert('Add some content'); return; }

  const notes = getNotes(activeUser);
  if(editingId){
    const idx = notes.findIndex(n=>n.id===editingId);
    if(idx!==-1){
      notes[idx].title = title;
      notes[idx].content = content;
      notes[idx].date = date;
      notes[idx].updated_at = new Date().toISOString();
    }
  } else {
    const id = 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    notes.unshift({id,title,content,date,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
  }
  setNotes(activeUser, notes);
  toggleNoteForm(false);
  renderNotes();
});


function renderNotes(){
  notesList.innerHTML = '';
  if(!activeUser){
    notesCount.textContent = '0 notes — log in to save notes';
    return;
  }
  const all = getNotes(activeUser);
  const q = searchInput.value.trim().toLowerCase();
  const filtered = all.filter(n=>!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.date.includes(q));

  if(filtered.length===0){
    notesList.innerHTML = '<div style="grid-column:1/-1;padding:30px;border-radius:8px;background:#fff;border:1px dashed #e6eef6;text-align:center;color:#64748b">No notes found. Click New Note to add one.</div>';
  } else {
    filtered.forEach(n=>{
      const card = document.createElement('article');
      card.className = 'note';
      card.innerHTML = `
        <h3>${n.title || '(no title)'}</h3>
        <p>${n.content || ''}</p>
        <div class="meta">
          <div>${n.date || ''}</div>
          <div>
            <button class="editBtn" style="color:#0f172a;font-weight:700;margin-right:8px">Edit</button>
            <button class="delBtn">Delete</button>
          </div>
        </div>`;
      card.querySelector('.editBtn').addEventListener('click', ()=>{
        toggleNoteForm(true);
        noteTitle.value = n.title;
        noteContent.value = n.content;
        noteDate.value = n.date;
        editingId = n.id;
      });
      card.querySelector('.delBtn').addEventListener('click', ()=>{
        if(confirm('Delete this note?')){
          const newNotes = all.filter(x=>x.id!==n.id);
          setNotes(activeUser, newNotes);
          renderNotes();
        }
      });
      notesList.appendChild(card);
    });
  }
  notesCount.textContent = `${filtered.length} note${filtered.length!==1?'s':''}`;
}


searchInput.addEventListener('input', ()=>renderNotes());
exportBtn.addEventListener('click', ()=>{
  if(!activeUser){ alert('Log in to export notes'); return; }
  const notes = getNotes(activeUser);
  const blob = new Blob([JSON.stringify(notes,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `notes_${activeUser}.json`;
  a.click();
  URL.revokeObjectURL(url);
});


document.add
