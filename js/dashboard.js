document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. SECURITY & USER DATA
    // ==========================================
    if (localStorage.getItem('isLoggedIn') !== 'true') { 
        window.location.href = 'login.html'; 
        return; 
    }

    const activeName = localStorage.getItem('active_name');
    const activeEmail = localStorage.getItem('active_email');
    const activeUsername = localStorage.getItem('active_username');
    
    if(activeName) {
        document.querySelector('.user-welcome').textContent = `Welcome, ${activeName}`;
        document.getElementById('display-name').textContent = activeName;
    }
    if(activeUsername) document.getElementById('display-username').textContent = activeUsername;
    if(activeEmail) document.getElementById('display-email').textContent = activeEmail;

    // ==========================================
    // 2. DATABASES INITIALIZATION
    // ==========================================
    let tasks = JSON.parse(localStorage.getItem('user_tasks')) || [];
    let team = JSON.parse(localStorage.getItem('user_team')) || [];
    let notes = JSON.parse(localStorage.getItem('user_notes')) || [];

    // Auto-add the logged-in user to the team if the team is empty
    if (team.length === 0 && activeName) {
        team.push({ id: 'user-self', name: activeName, role: 'Manager (You)' });
        localStorage.setItem('user_team', JSON.stringify(team));
    }

    // ==========================================
    // 3. NAVIGATION LOGIC
    // ==========================================
    const navs = ['dashboard', 'tasks', 'team', 'notes', 'profile'].reduce((acc, id) => {
        acc[id] = document.getElementById(`nav-${id}`);
        return acc;
    }, {});
    
    const views = ['dashboard', 'tasks', 'team', 'notes', 'profile'].reduce((acc, id) => {
        acc[id] = document.getElementById(`view-${id}`);
        return acc;
    }, {});

    const switchView = (activeKey) => {
        Object.values(navs).forEach(nav => nav.classList.remove('active'));
        navs[activeKey].classList.add('active');
        Object.values(views).forEach(view => view.classList.add('hidden'));
        views[activeKey].classList.remove('hidden');
    };

    navs.dashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); renderApp(); });
    navs.tasks.addEventListener('click', (e) => { e.preventDefault(); switchView('tasks'); renderApp(); });
    navs.team.addEventListener('click', (e) => { e.preventDefault(); switchView('team'); renderApp(); });
    navs.notes.addEventListener('click', (e) => { e.preventDefault(); switchView('notes'); renderApp(); });
    navs.profile.addEventListener('click', (e) => { e.preventDefault(); switchView('profile'); });

    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });

    // ==========================================
    // 4. TEAM DIRECTORY LOGIC
    // ==========================================
    const memberModal = document.getElementById('member-modal');
    const memberForm = document.getElementById('member-form');

    document.getElementById('add-member-btn').addEventListener('click', () => { 
        memberForm.reset(); 
        memberModal.classList.remove('hidden'); 
    });
    
    document.getElementById('close-member-modal').addEventListener('click', () => memberModal.classList.add('hidden'));

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        team.push({ 
            id: 'team_' + Date.now().toString(), 
            name: document.getElementById('member-name').value, 
            role: document.getElementById('member-role').value 
        });
        localStorage.setItem('user_team', JSON.stringify(team));
        memberModal.classList.add('hidden');
        renderApp();
    });

    window.deleteMember = (id) => {
        if(confirm('Remove this team member? Unassigned tasks will remain but have no assignee.')) {
            team = team.filter(m => m.id !== id);
            tasks = tasks.map(t => { if(t.assignee === id) t.assignee = 'unassigned'; return t; });
            localStorage.setItem('user_team', JSON.stringify(team));
            localStorage.setItem('user_tasks', JSON.stringify(tasks));
            renderApp();
        }
    };

    // ==========================================
    // 5. TASK LOGIC & DRAG/DROP
    // ==========================================
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    
    // Set minimum date for tasks to today
    const today = new Date().toISOString().split('T')[0]; 
    document.getElementById('task-date').setAttribute('min', today);

    // Re-render tasks when sort dropdown changes
    document.getElementById('sort-tasks').addEventListener('change', () => {
        renderApp();
    });

    document.getElementById('add-task-btn').addEventListener('click', () => {
        taskForm.reset(); 
        document.getElementById('task-id').value = ''; 
        document.getElementById('task-status').value = 'todo';
        document.getElementById('modal-title').textContent = 'Add New Task'; 
        taskModal.classList.remove('hidden');
    });
    
    document.getElementById('close-modal').addEventListener('click', () => taskModal.classList.add('hidden'));

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const newTask = {
            id: id ? id : Date.now().toString(), 
            title: document.getElementById('task-title').value, 
            priority: document.getElementById('task-priority').value,
            date: document.getElementById('task-date').value, 
            desc: document.getElementById('task-desc').value, 
            status: document.getElementById('task-status').value,
            assignee: document.getElementById('task-assignee').value
        };
        
        if (id) tasks = tasks.map(t => t.id === id ? newTask : t); 
        else tasks.push(newTask);
        
        localStorage.setItem('user_tasks', JSON.stringify(tasks)); 
        taskModal.classList.add('hidden'); 
        renderApp();
    });

    window.editTask = (id) => {
        const task = tasks.find(t => t.id === id); 
        if(!task) return;
        document.getElementById('task-id').value = task.id; 
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-priority').value = task.priority; 
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-assignee').value = task.assignee || 'unassigned'; 
        document.getElementById('task-desc').value = task.desc;
        document.getElementById('task-status').value = task.status; 
        document.getElementById('modal-title').textContent = 'Edit Task';
        taskModal.classList.remove('hidden');
    };

    window.deleteTask = (id) => {
        if(confirm('Are you sure you want to delete this task?')) { 
            tasks = tasks.filter(t => t.id !== id); 
            localStorage.setItem('user_tasks', JSON.stringify(tasks)); 
            renderApp(); 
        }
    };

    // Drag and Drop Logic
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', (e) => { e.preventDefault(); column.style.backgroundColor = '#e1e4e8'; });
        column.addEventListener('dragleave', () => { column.style.backgroundColor = '#f0f2f5'; });
        column.addEventListener('drop', (e) => {
            e.preventDefault(); 
            column.style.backgroundColor = '#f0f2f5';
            tasks = tasks.map(t => { 
                if(t.id === e.dataTransfer.getData('text/plain')) t.status = column.dataset.status; 
                return t; 
            });
            localStorage.setItem('user_tasks', JSON.stringify(tasks)); 
            renderApp();
        });
    });

    // ==========================================
    // 6. NOTES LOGIC & SEARCH
    // ==========================================
    const noteModal = document.getElementById('note-modal');
    const noteForm = document.getElementById('note-form');
    const searchInput = document.getElementById('search-notes');

    document.getElementById('add-note-btn').addEventListener('click', () => {
        noteForm.reset();
        document.getElementById('note-id').value = '';
        document.getElementById('note-modal-title').textContent = 'Add New Note';
        noteModal.classList.remove('hidden');
    });
    
    document.getElementById('close-note-modal').addEventListener('click', () => noteModal.classList.add('hidden'));

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('note-id').value;
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        
        const newNote = {
            id: id ? id : 'note_' + Date.now().toString(),
            title: document.getElementById('note-title').value,
            content: document.getElementById('note-content').value,
            date: new Date().toLocaleDateString('en-US', dateOptions)
        };

        if (id) notes = notes.map(n => n.id === id ? newNote : n);
        else notes.unshift(newNote); // Add to top

        localStorage.setItem('user_notes', JSON.stringify(notes));
        noteModal.classList.add('hidden');
        renderNotes(searchInput.value.toLowerCase()); 
    });

    window.editNote = (id) => {
        const note = notes.find(n => n.id === id);
        if(!note) return;
        document.getElementById('note-id').value = note.id;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        document.getElementById('note-modal-title').textContent = 'Edit Note';
        noteModal.classList.remove('hidden');
    };

    window.deleteNote = (id) => {
        if(confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            localStorage.setItem('user_notes', JSON.stringify(notes));
            renderNotes(searchInput.value.toLowerCase());
        }
    };

    // Live Search Event Listener
    searchInput.addEventListener('keyup', () => {
        renderNotes(searchInput.value.toLowerCase());
    });

    // ==========================================
    // 7. RENDER ENGINES
    // ==========================================
    
    const renderNotes = (searchFilter = '') => {
        const notesGrid = document.getElementById('notes-list');
        notesGrid.innerHTML = '';
        
        const filteredNotes = notes.filter(note => {
            return note.title.toLowerCase().includes(searchFilter) || 
                   note.content.toLowerCase().includes(searchFilter);
        });

        if(filteredNotes.length === 0) {
            notesGrid.innerHTML = `<p style="color: #888; grid-column: 1 / -1;">No notes found.</p>`;
            return;
        }

        filteredNotes.forEach(note => {
            notesGrid.innerHTML += `
                <div class="note-card">
                    <h3>${note.title}</h3>
                    <div class="note-date">📅 ${note.date}</div>
                    <p>${note.content}</p>
                    <div class="note-actions">
                        <button onclick="editNote('${note.id}')">Edit</button>
                        <button class="del-note" onclick="deleteNote('${note.id}')">Delete</button>
                    </div>
                </div>`;
        });
    };

    const renderApp = () => {
        // A. Update Dashboard Stats
        document.getElementById('stat-total').textContent = tasks.length;
        document.getElementById('stat-completed').textContent = tasks.filter(t => t.status === 'completed').length;
        document.getElementById('stat-pending').textContent = tasks.filter(t => t.status !== 'completed').length;

        // B. Update Task Form Assignee Dropdown
        const assigneeDropdown = document.getElementById('task-assignee');
        if (assigneeDropdown) {
            assigneeDropdown.innerHTML = '<option value="unassigned">Unassigned</option>';
            team.forEach(member => assigneeDropdown.innerHTML += `<option value="${member.id}">${member.name}</option>`);
        }

        // C. Render Team Directory
        const teamGrid = document.getElementById('team-list');
        if (teamGrid) {
            teamGrid.innerHTML = '';
            team.forEach(member => {
                const taskCount = tasks.filter(t => t.assignee === member.id).length;
                const initials = member.name.substring(0, 2).toUpperCase();
                teamGrid.innerHTML += `
                    <div class="team-card">
                        <div class="team-avatar">${initials}</div>
                        <h3>${member.name}</h3><p>${member.role}</p>
                        <div class="task-count">📝 ${taskCount} Tasks Assigned</div>
                        ${member.id !== 'user-self' ? `<button class="del-member" onclick="deleteMember('${member.id}')">Remove</button>` : ''}
                    </div>`;
            });
        }

        // D. Render Kanban Board WITH SORTING ALGORITHM
        const columns = { 
            todo: document.getElementById('list-todo'), 
            progress: document.getElementById('list-progress'), 
            completed: document.getElementById('list-completed') 
        };
        Object.values(columns).forEach(col => { if(col) col.innerHTML = ''; });

        const sortSelect = document.getElementById('sort-tasks');
        const sortOption = sortSelect ? sortSelect.value : 'default';
        let displayTasks = [...tasks]; 

        // Apply Sorting
        if (sortOption === 'date-asc') {
            displayTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortOption === 'date-desc') {
            displayTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortOption.startsWith('priority')) {
            const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
            if (sortOption === 'priority-desc') {
                displayTasks.sort((a, b) => weight[b.priority] - weight[a.priority]); 
            } else {
                displayTasks.sort((a, b) => weight[a.priority] - weight[b.priority]); 
            }
        } else {
            displayTasks.reverse(); 
        }

        // Output Sorted Tasks to HTML
        displayTasks.forEach(task => {
            const card = document.createElement('div'); 
            card.className = 'task-card'; 
            card.draggable = true; 
            card.dataset.id = task.id;
            
            const assignedPerson = team.find(m => m.id === task.assignee);
            
            card.innerHTML = `
                <div class="task-meta">
                    <span class="priority p-${task.priority}">${task.priority}</span>
                    <span class="due-date">📅 ${task.date}</span>
                </div>
                <h4>${task.title}</h4>
                <span class="assignee-badge">👤 ${assignedPerson ? assignedPerson.name : 'Unassigned'}</span>
                <p>${task.desc}</p>
                <div class="task-actions">
                    <button onclick="editTask('${task.id}')">Edit</button>
                    <button class="del" onclick="deleteTask('${task.id}')">Delete</button>
                </div>`;
                
            card.addEventListener('dragstart', (e) => { 
                e.dataTransfer.setData('text/plain', task.id); 
                setTimeout(() => card.style.opacity = '0.5', 0); 
            });
            card.addEventListener('dragend', () => card.style.opacity = '1');
            
            if(columns[task.status]) columns[task.status].appendChild(card);
        });
        
        // E. Keep notes in sync
        renderNotes(searchInput ? searchInput.value.toLowerCase() : '');
    };

    // ==========================================
    // 8. INITIALIZE APP
    // ==========================================
    renderApp();
});