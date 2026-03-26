/* =====================================================
   STUDENT LIFE MANAGER - MAIN JAVASCRIPT
   ===================================================== */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get data from LocalStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Save data to LocalStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get settings from LocalStorage
function getSettings() {
    const settings = localStorage.getItem('settings');
    return settings ? JSON.parse(settings) : {
        name: 'Student',
        email: '',
        darkMode: false,
        compactSidebar: false,
        assignmentNotif: true,
        classNotif: true
    };
}

// Save settings
function saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// =====================================================
// LOADING SCREEN
// =====================================================

function hideLoading() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 500);
}

// =====================================================
// SIDEBAR & NAVIGATION
// =====================================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const menuToggle = document.getElementById('menuToggle');
    const settings = getSettings();

    // Apply compact sidebar if saved
    if (settings.compactSidebar && sidebar) {
        sidebar.classList.add('collapsed');
    }

    // Toggle sidebar on desktop
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            const currentSettings = getSettings();
            currentSettings.compactSidebar = isCollapsed;
            saveSettings(currentSettings);
        });
    }

    // Toggle sidebar on mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
}

// =====================================================
// DARK MODE
// =====================================================

function initDarkMode() {
    const settings = getSettings();
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    const settings = getSettings();
    settings.darkMode = enabled;
    saveSettings(settings);
}

// =====================================================
// NOTIFICATIONS
// =====================================================

function initNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            notificationDropdown.classList.remove('show');
        });
    }

    // Update notification badge
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const assignments = getData('assignments');
    const now = new Date();
    
    // Count pending assignments due in next 3 days
    const upcoming = assignments.filter(a => {
        if (a.status === 'completed') return false;
        const dueDate = new Date(a.dueDate);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    });

    if (badge) {
        badge.textContent = upcoming.length;
        badge.style.display = upcoming.length > 0 ? 'flex' : 'none';
    }
}

// =====================================================
// USER PROFILE
// =====================================================

function initUserProfile() {
    const settings = getSettings();
    const userNameElements = document.querySelectorAll('#userName, .user-name');
    const avatarElements = document.querySelectorAll('#userAvatar, .avatar');

    userNameElements.forEach(el => {
        if (el) el.textContent = settings.name || 'Student';
    });

    avatarElements.forEach(el => {
        if (el) {
            const name = encodeURIComponent(settings.name || 'Student');
            el.src = `https://ui-avatars.com/api/?name=${name}&background=10b981&color=fff`;
        }
    });
}

// =====================================================
// SEARCH FUNCTIONALITY
// =====================================================

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            handleSearch(query);
        });
    }
}

function handleSearch(query) {
    // This will be customized per page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'courses.html') {
        searchCourses(query);
    } else if (currentPage === 'assignments.html') {
        searchAssignments(query);
    } else if (currentPage === 'notes.html') {
        searchNotes(query);
    }
}

// =====================================================
// MODALS
// =====================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function initModalClose(modalId, closeIds) {
    const modal = document.getElementById(modalId);
    const overlay = modal?.querySelector('.modal-overlay');
    
    closeIds.forEach(id => {
        const closeBtn = document.getElementById(id);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modalId));
        }
    });

    if (overlay) {
        overlay.addEventListener('click', () => closeModal(modalId));
    }
}

// =====================================================
// DASHBOARD PAGE
// =====================================================

function initDashboard() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    updateDashboardStats();
    loadUpcomingTasks();
    loadTodaySchedule();
    loadRecentNotes();
}

function updateDashboardStats() {
    const courses = getData('courses');
    const assignments = getData('assignments');
    const transactions = getData('transactions');
    const schedule = getData('schedule');

    // Total courses
    document.getElementById('totalCourses').textContent = courses.length;

    // Upcoming assignments (pending)
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    document.getElementById('upcomingAssignments').textContent = pendingAssignments.length;

    // Current balance
    let balance = 0;
    transactions.forEach(t => {
        if (t.type === 'income') {
            balance += parseFloat(t.amount);
        } else {
            balance -= parseFloat(t.amount);
        }
    });
    document.getElementById('currentBalance').textContent = '$' + balance.toFixed(2);

    // Study hours (calculate from schedule)
    let totalHours = 0;
    schedule.forEach(s => {
        const start = new Date(`2000-01-01T${s.startTime}`);
        const end = new Date(`2000-01-01T${s.endTime}`);
        totalHours += (end - start) / (1000 * 60 * 60);
    });
    document.getElementById('studyHours').textContent = Math.round(totalHours) + 'h';
}

function loadUpcomingTasks() {
    const tasksList = document.getElementById('upcomingTasksList');
    if (!tasksList) return;

    const assignments = getData('assignments');
    const pendingAssignments = assignments
        .filter(a => a.status === 'pending')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    if (pendingAssignments.length === 0) {
        tasksList.innerHTML = '<li class="empty-state">No upcoming tasks</li>';
        return;
    }

    tasksList.innerHTML = pendingAssignments.map(a => `
        <li>
            <i class="fas fa-circle-check"></i>
            <div class="task-info">
                <span class="task-title">${a.title}</span>
                <span class="task-due">Due: ${formatDate(a.dueDate)}</span>
            </div>
        </li>
    `).join('');
}

function loadTodaySchedule() {
    const scheduleList = document.getElementById('todaySchedule');
    if (!scheduleList) return;

    const schedule = getData('schedule');
    const courses = getData('courses');
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    const todayClasses = schedule
        .filter(s => s.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayClasses.length === 0) {
        scheduleList.innerHTML = '<div class="empty-state">No classes today</div>';
        return;
    }

    scheduleList.innerHTML = todayClasses.map(s => {
        const course = courses.find(c => c.id === s.courseId);
        return `
            <div class="schedule-item">
                <span class="schedule-time">${s.startTime} - ${s.endTime}</span>
                <div class="schedule-info">
                    <h4>${course ? course.name : 'Unknown Course'}</h4>
                    <p>${s.room || 'No room specified'}</p>
                </div>
            </div>
        `;
    }).join('');
}

function loadRecentNotes() {
    const notesContainer = document.getElementById('recentNotes');
    if (!notesContainer) return;

    const notes = getData('notes')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);

    if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="empty-state">No notes yet</div>';
        return;
    }

    notesContainer.innerHTML = notes.map(n => `
        <div class="note-preview-item">
            <h4>${n.title}</h4>
            <p>${n.content.substring(0, 100)}${n.content.length > 100 ? '...' : ''}</p>
        </div>
    `).join('');
}

// =====================================================
// COURSES PAGE
// =====================================================

function initCourses() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    loadCourses();
    initCourseModal();
}

function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;

    const courses = getData('courses');

    if (courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-book-open"></i>
                <p>No courses yet. Add your first course!</p>
            </div>
        `;
        return;
    }

    coursesGrid.innerHTML = courses.map(c => `
        <div class="course-card" data-id="${c.id}">
            <div class="course-header" style="background: ${c.color}">
                <h3>${c.name}</h3>
                <p><i class="fas fa-user"></i> ${c.teacher}</p>
            </div>
            <div class="course-body">
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${c.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${c.progress}%; background: ${c.color}"></div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-view" onclick="viewCourse('${c.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-edit" onclick="editCourse('${c.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteCourse('${c.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initCourseModal() {
    const addBtn = document.getElementById('addCourseBtn');
    const form = document.getElementById('courseForm');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('courseModalTitle').textContent = 'Add New Course';
            document.getElementById('courseId').value = '';
            form.reset();
            openModal('courseModal');
        });
    }

    initModalClose('courseModal', ['closeCourseModal', 'cancelCourse']);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveCourse();
        });
    }
}

function saveCourse() {
    const courses = getData('courses');
    const id = document.getElementById('courseId').value;
    
    const courseData = {
        name: document.getElementById('courseName').value,
        teacher: document.getElementById('courseTeacher').value,
        progress: parseInt(document.getElementById('courseProgress').value) || 0,
        color: document.getElementById('courseColor').value
    };

    if (id) {
        // Update existing
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...courseData };
        }
    } else {
        // Add new
        courseData.id = generateId();
        courses.push(courseData);
    }

    saveData('courses', courses);
    closeModal('courseModal');
    loadCourses();
}

function editCourse(id) {
    const courses = getData('courses');
    const course = courses.find(c => c.id === id);
    
    if (course) {
        document.getElementById('courseModalTitle').textContent = 'Edit Course';
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseTeacher').value = course.teacher;
        document.getElementById('courseProgress').value = course.progress;
        document.getElementById('courseColor').value = course.color;
        openModal('courseModal');
    }
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        let courses = getData('courses');
        courses = courses.filter(c => c.id !== id);
        saveData('courses', courses);
        loadCourses();
    }
}

function viewCourse(id) {
    // Could open a detail view - for now just edit
    editCourse(id);
}

function searchCourses(query) {
    const courses = getData('courses');
    const filtered = courses.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.teacher.toLowerCase().includes(query)
    );
    
    const coursesGrid = document.getElementById('coursesGrid');
    if (filtered.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <p>No courses found matching "${query}"</p>
            </div>
        `;
        return;
    }

    coursesGrid.innerHTML = filtered.map(c => `
        <div class="course-card" data-id="${c.id}">
            <div class="course-header" style="background: ${c.color}">
                <h3>${c.name}</h3>
                <p><i class="fas fa-user"></i> ${c.teacher}</p>
            </div>
            <div class="course-body">
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${c.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${c.progress}%; background: ${c.color}"></div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-view" onclick="viewCourse('${c.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-edit" onclick="editCourse('${c.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteCourse('${c.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =====================================================
// ASSIGNMENTS PAGE
// =====================================================

function initAssignments() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    loadAssignments();
    initAssignmentModal();
    initAssignmentFilters();
}

function loadAssignments(filter = 'all') {
    const tbody = document.getElementById('assignmentsBody');
    const emptyState = document.getElementById('emptyAssignments');
    const table = document.querySelector('.data-table');
    
    if (!tbody) return;

    let assignments = getData('assignments');
    const courses = getData('courses');

    // Apply filter
    if (filter === 'pending') {
        assignments = assignments.filter(a => a.status === 'pending');
    } else if (filter === 'completed') {
        assignments = assignments.filter(a => a.status === 'completed');
    }

    // Sort by due date
    assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (assignments.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    tbody.innerHTML = assignments.map(a => {
        const course = courses.find(c => c.id === a.courseId);
        const dueDate = new Date(a.dueDate);
        const now = new Date();
        const isOverdue = a.status === 'pending' && dueDate < now;
        
        let statusClass = a.status;
        if (isOverdue) statusClass = 'overdue';

        return `
            <tr>
                <td><strong>${a.title}</strong></td>
                <td>${course ? course.name : 'Unknown'}</td>
                <td>${formatDate(a.dueDate)}</td>
                <td>
                    <span class="status ${statusClass}">
                        <i class="fas fa-${a.status === 'completed' ? 'check' : isOverdue ? 'exclamation' : 'clock'}"></i>
                        ${isOverdue ? 'Overdue' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        ${a.status === 'pending' ? `
                            <button class="complete-btn" onclick="completeAssignment('${a.id}')" title="Mark Complete">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="edit-btn" onclick="editAssignment('${a.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteAssignment('${a.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function initAssignmentModal() {
    const addBtn = document.getElementById('addAssignmentBtn');
    const form = document.getElementById('assignmentForm');
    const courseSelect = document.getElementById('assignmentCourse');

    // Populate course select
    if (courseSelect) {
        const courses = getData('courses');
        courseSelect.innerHTML = '<option value="">Select a course</option>' +
            courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('assignmentModalTitle').textContent = 'Add New Assignment';
            document.getElementById('assignmentId').value = '';
            form.reset();
            // Set default date to today
            document.getElementById('assignmentDue').value = new Date().toISOString().split('T')[0];
            openModal('assignmentModal');
        });
    }

    initModalClose('assignmentModal', ['closeAssignmentModal', 'cancelAssignment']);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAssignment();
        });
    }
}

function initAssignmentFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadAssignments(btn.dataset.filter);
        });
    });
}

function saveAssignment() {
    const assignments = getData('assignments');
    const id = document.getElementById('assignmentId').value;
    
    const assignmentData = {
        title: document.getElementById('assignmentTitle').value,
        courseId: document.getElementById('assignmentCourse').value,
        dueDate: document.getElementById('assignmentDue').value,
        status: document.getElementById('assignmentStatus').value,
        description: document.getElementById('assignmentDescription').value
    };

    if (id) {
        const index = assignments.findIndex(a => a.id === id);
        if (index !== -1) {
            assignments[index] = { ...assignments[index], ...assignmentData };
        }
    } else {
        assignmentData.id = generateId();
        assignmentData.createdAt = new Date().toISOString();
        assignments.push(assignmentData);
    }

    saveData('assignments', assignments);
    closeModal('assignmentModal');
    loadAssignments();
    updateNotificationBadge();
}

function editAssignment(id) {
    const assignments = getData('assignments');
    const assignment = assignments.find(a => a.id === id);
    
    if (assignment) {
        document.getElementById('assignmentModalTitle').textContent = 'Edit Assignment';
        document.getElementById('assignmentId').value = assignment.id;
        document.getElementById('assignmentTitle').value = assignment.title;
        document.getElementById('assignmentCourse').value = assignment.courseId;
        document.getElementById('assignmentDue').value = assignment.dueDate;
        document.getElementById('assignmentStatus').value = assignment.status;
        document.getElementById('assignmentDescription').value = assignment.description || '';
        openModal('assignmentModal');
    }
}

function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        let assignments = getData('assignments');
        assignments = assignments.filter(a => a.id !== id);
        saveData('assignments', assignments);
        loadAssignments();
        updateNotificationBadge();
    }
}

function completeAssignment(id) {
    const assignments = getData('assignments');
    const index = assignments.findIndex(a => a.id === id);
    
    if (index !== -1) {
        assignments[index].status = 'completed';
        saveData('assignments', assignments);
        loadAssignments();
        updateNotificationBadge();
    }
}

function searchAssignments(query) {
    const assignments = getData('assignments');
    const courses = getData('courses');
    
    const filtered = assignments.filter(a => {
        const course = courses.find(c => c.id === a.courseId);
        return a.title.toLowerCase().includes(query) ||
            (course && course.name.toLowerCase().includes(query));
    });

    const tbody = document.getElementById('assignmentsBody');
    if (!tbody) return;

    tbody.innerHTML = filtered.map(a => {
        const course = courses.find(c => c.id === a.courseId);
        return `
            <tr>
                <td><strong>${a.title}</strong></td>
                <td>${course ? course.name : 'Unknown'}</td>
                <td>${formatDate(a.dueDate)}</td>
                <td>
                    <span class="status ${a.status}">
                        ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editAssignment('${a.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteAssignment('${a.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// =====================================================
// SCHEDULE PAGE
// =====================================================

function initSchedule() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    generateScheduleGrid();
    loadSchedule();
    initScheduleModal();
}

function generateScheduleGrid() {
    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody) return;

    const timeSlots = [];
    for (let h = 8; h <= 20; h++) {
        timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    let html = '';
    timeSlots.forEach(time => {
        html += `<div class="time-slot">${time}</div>`;
        for (let d = 0; d < 7; d++) {
            html += `<div class="day-cell" data-time="${time}" data-day="${d}"></div>`;
        }
    });

    scheduleBody.innerHTML = html;
}

function loadSchedule() {
    const schedule = getData('schedule');
    const courses = getData('courses');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Clear existing classes
    document.querySelectorAll('.class-block').forEach(el => el.remove());

    schedule.forEach(s => {
        const course = courses.find(c => c.id === s.courseId);
        const dayIndex = days.indexOf(s.day);
        const startHour = parseInt(s.startTime.split(':')[0]);
        
        const cell = document.querySelector(`.day-cell[data-time="${startHour.toString().padStart(2, '0')}:00"][data-day="${dayIndex}"]`);
        
        if (cell && course) {
            const classBlock = document.createElement('div');
            classBlock.className = 'class-block';
            classBlock.style.background = course.color;
            classBlock.innerHTML = `
                <h4>${course.name}</h4>
                <p>${s.startTime} - ${s.endTime}</p>
            `;
            classBlock.onclick = () => editScheduleItem(s.id);
            cell.appendChild(classBlock);
        }
    });
}

function initScheduleModal() {
    const addBtn = document.getElementById('addScheduleBtn');
    const form = document.getElementById('scheduleForm');
    const courseSelect = document.getElementById('scheduleClass');

    // Populate course select
    if (courseSelect) {
        const courses = getData('courses');
        courseSelect.innerHTML = '<option value="">Select a course</option>' +
            courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('scheduleModalTitle').textContent = 'Add Class';
            document.getElementById('scheduleId').value = '';
            form.reset();
            openModal('scheduleModal');
        });
    }

    initModalClose('scheduleModal', ['closeScheduleModal', 'cancelSchedule']);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveScheduleItem();
        });
    }
}

function saveScheduleItem() {
    const schedule = getData('schedule');
    const id = document.getElementById('scheduleId').value;
    
    const scheduleData = {
        courseId: document.getElementById('scheduleClass').value,
        day: document.getElementById('scheduleDay').value,
        startTime: document.getElementById('scheduleStart').value,
        endTime: document.getElementById('scheduleEnd').value,
        room: document.getElementById('scheduleRoom').value
    };

    if (id) {
        const index = schedule.findIndex(s => s.id === id);
        if (index !== -1) {
            schedule[index] = { ...schedule[index], ...scheduleData };
        }
    } else {
        scheduleData.id = generateId();
        schedule.push(scheduleData);
    }

    saveData('schedule', schedule);
    closeModal('scheduleModal');
    loadSchedule();
}

function editScheduleItem(id) {
    const schedule = getData('schedule');
    const item = schedule.find(s => s.id === id);
    
    if (item) {
        document.getElementById('scheduleModalTitle').textContent = 'Edit Class';
        document.getElementById('scheduleId').value = item.id;
        document.getElementById('scheduleClass').value = item.courseId;
        document.getElementById('scheduleDay').value = item.day;
        document.getElementById('scheduleStart').value = item.startTime;
        document.getElementById('scheduleEnd').value = item.endTime;
        document.getElementById('scheduleRoom').value = item.room || '';
        openModal('scheduleModal');
    }
}

function deleteScheduleItem(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        let schedule = getData('schedule');
        schedule = schedule.filter(s => s.id !== id);
        saveData('schedule', schedule);
        loadSchedule();
    }
}

// =====================================================
// FINANCE PAGE
// =====================================================

let expensesChart = null;

function initFinance() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    updateFinanceStats();
    loadTransactions();
    initFinanceChart();
    initTransactionModal();
}

function updateFinanceStats() {
    const transactions = getData('transactions');
    
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            income += parseFloat(t.amount);
        } else {
            expenses += parseFloat(t.amount);
        }
    });

    const balance = income - expenses;

    document.getElementById('totalBalance').textContent = '$' + balance.toFixed(2);
    document.getElementById('totalIncome').textContent = '$' + income.toFixed(2);
    document.getElementById('totalExpenses').textContent = '$' + expenses.toFixed(2);
}

function loadTransactions() {
    const tbody = document.getElementById('transactionsBody');
    const emptyState = document.getElementById('emptyTransactions');
    const table = document.querySelector('.transactions-card .data-table');
    
    if (!tbody) return;

    const transactions = getData('transactions')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (transactions.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';

    const categoryIcons = {
        food: 'utensils',
        transport: 'car',
        education: 'graduation-cap',
        entertainment: 'film',
        shopping: 'shopping-bag',
        health: 'heartbeat',
        other: 'ellipsis-h'
    };

    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>
                <i class="fas fa-${t.type === 'income' ? 'arrow-up' : 'arrow-down'}" 
                   style="color: ${t.type === 'income' ? '#10b981' : '#ef4444'}; margin-right: 8px;"></i>
                ${t.description}
            </td>
            <td>
                <i class="fas fa-${categoryIcons[t.category] || 'tag'}" style="margin-right: 6px;"></i>
                ${t.category.charAt(0).toUpperCase() + t.category.slice(1)}
            </td>
            <td style="color: ${t.type === 'income' ? '#10b981' : '#ef4444'}; font-weight: 600;">
                ${t.type === 'income' ? '+' : '-'}$${parseFloat(t.amount).toFixed(2)}
            </td>
            <td>${formatDate(t.date)}</td>
            <td>
                <div class="table-actions">
                    <button class="edit-btn" onclick="editTransaction('${t.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initFinanceChart() {
    const ctx = document.getElementById('expensesChart');
    if (!ctx) return;

    const transactions = getData('transactions').filter(t => t.type === 'expense');
    
    // Group by category
    const categories = {};
    transactions.forEach(t => {
        if (!categories[t.category]) {
            categories[t.category] = 0;
        }
        categories[t.category] += parseFloat(t.amount);
    });

    const colors = {
        food: '#f59e0b',
        transport: '#3b82f6',
        education: '#8b5cf6',
        entertainment: '#ec4899',
        shopping: '#10b981',
        health: '#ef4444',
        other: '#6b7280'
    };

    if (expensesChart) {
        expensesChart.destroy();
    }

    expensesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: Object.keys(categories).map(c => colors[c] || '#6b7280'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function initTransactionModal() {
    const addBtn = document.getElementById('addTransactionBtn');
    const form = document.getElementById('transactionForm');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('transactionModalTitle').textContent = 'Add Transaction';
            document.getElementById('transactionId').value = '';
            form.reset();
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
            openModal('transactionModal');
        });
    }

    initModalClose('transactionModal', ['closeTransactionModal', 'cancelTransaction']);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTransaction();
        });
    }
}

function saveTransaction() {
    const transactions = getData('transactions');
    const id = document.getElementById('transactionId').value;
    
    const transactionData = {
        type: document.getElementById('transactionType').value,
        description: document.getElementById('transactionDesc').value,
        amount: document.getElementById('transactionAmount').value,
        category: document.getElementById('transactionCategory').value,
        date: document.getElementById('transactionDate').value
    };

    if (id) {
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...transactionData };
        }
    } else {
        transactionData.id = generateId();
        transactions.push(transactionData);
    }

    saveData('transactions', transactions);
    closeModal('transactionModal');
    updateFinanceStats();
    loadTransactions();
    initFinanceChart();
}

function editTransaction(id) {
    const transactions = getData('transactions');
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction) {
        document.getElementById('transactionModalTitle').textContent = 'Edit Transaction';
        document.getElementById('transactionId').value = transaction.id;
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionDesc').value = transaction.description;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDate').value = transaction.date;
        openModal('transactionModal');
    }
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        let transactions = getData('transactions');
        transactions = transactions.filter(t => t.id !== id);
        saveData('transactions', transactions);
        updateFinanceStats();
        loadTransactions();
        initFinanceChart();
    }
}

// =====================================================
// NOTES PAGE
// =====================================================

function initNotes() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();
    initSearch();

    loadNotes();
    initNoteModal();
}

function loadNotes() {
    const notesGrid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyNotes');
    
    if (!notesGrid) return;

    const notes = getData('notes')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (notes.length === 0) {
        notesGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    notesGrid.innerHTML = notes.map(n => `
        <div class="note-card" style="background: ${n.color}" data-id="${n.id}">
            <div class="note-card-header">
                <h3>${n.title}</h3>
            </div>
            <div class="note-card-content">
                <p>${n.content}</p>
            </div>
            <div class="note-card-footer">
                <span class="note-date">${formatDate(n.updatedAt)}</span>
                <div class="note-actions">
                    <button onclick="editNote('${n.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteNote('${n.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initNoteModal() {
    const addBtn = document.getElementById('addNoteBtn');
    const form = document.getElementById('noteForm');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('noteModalTitle').textContent = 'New Note';
            document.getElementById('noteId').value = '';
            form.reset();
            document.getElementById('colorWhite').checked = true;
            openModal('noteModal');
        });
    }

    initModalClose('noteModal', ['closeNoteModal', 'cancelNote']);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNote();
        });
    }
}

function saveNote() {
    const notes = getData('notes');
    const id = document.getElementById('noteId').value;
    const color = document.querySelector('input[name="noteColor"]:checked').value;
    
    const noteData = {
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value,
        color: color,
        updatedAt: new Date().toISOString()
    };

    if (id) {
        const index = notes.findIndex(n => n.id === id);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...noteData };
        }
    } else {
        noteData.id = generateId();
        noteData.createdAt = new Date().toISOString();
        notes.push(noteData);
    }

    saveData('notes', notes);
    closeModal('noteModal');
    loadNotes();
}

function editNote(id) {
    const notes = getData('notes');
    const note = notes.find(n => n.id === id);
    
    if (note) {
        document.getElementById('noteModalTitle').textContent = 'Edit Note';
        document.getElementById('noteId').value = note.id;
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        
        // Set color
        const colorInputs = document.querySelectorAll('input[name="noteColor"]');
        colorInputs.forEach(input => {
            input.checked = (input.value === note.color);
        });
        
        openModal('noteModal');
    }
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        let notes = getData('notes');
        notes = notes.filter(n => n.id !== id);
        saveData('notes', notes);
        loadNotes();
    }
}

function searchNotes(query) {
    const notes = getData('notes');
    const filtered = notes.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
    );

    const notesGrid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyNotes');
    
    if (filtered.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <p>No notes found matching "${query}"</p>
            </div>
        `;
        emptyState.style.display = 'none';
        return;
    }

    notesGrid.innerHTML = filtered.map(n => `
        <div class="note-card" style="background: ${n.color}" data-id="${n.id}">
            <div class="note-card-header">
                <h3>${n.title}</h3>
            </div>
            <div class="note-card-content">
                <p>${n.content}</p>
            </div>
            <div class="note-card-footer">
                <span class="note-date">${formatDate(n.updatedAt)}</span>
                <div class="note-actions">
                    <button onclick="editNote('${n.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteNote('${n.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =====================================================
// SETTINGS PAGE
// =====================================================

function initSettings() {
    hideLoading();
    initSidebar();
    initDarkMode();
    initNotifications();
    initUserProfile();

    loadSettingsValues();
    initSettingsEvents();
}

function loadSettingsValues() {
    const settings = getSettings();
    
    document.getElementById('settingsName').value = settings.name || '';
    document.getElementById('settingsEmail').value = settings.email || '';
    document.getElementById('darkModeToggle').checked = settings.darkMode || false;
    document.getElementById('compactSidebar').checked = settings.compactSidebar || false;
    document.getElementById('assignmentNotif').checked = settings.assignmentNotif !== false;
    document.getElementById('classNotif').checked = settings.classNotif !== false;
}

function initSettingsEvents() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const settings = getSettings();
            settings.name = document.getElementById('settingsName').value;
            settings.email = document.getElementById('settingsEmail').value;
            saveSettings(settings);
            initUserProfile();
            alert('Profile saved successfully!');
        });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            toggleDarkMode(e.target.checked);
        });
    }

    // Compact sidebar toggle
    const compactSidebar = document.getElementById('compactSidebar');
    if (compactSidebar) {
        compactSidebar.addEventListener('change', (e) => {
            const sidebar = document.getElementById('sidebar');
            if (e.target.checked) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
            const settings = getSettings();
            settings.compactSidebar = e.target.checked;
            saveSettings(settings);
        });
    }

    // Notification toggles
    const assignmentNotif = document.getElementById('assignmentNotif');
    const classNotif = document.getElementById('classNotif');
    
    if (assignmentNotif) {
        assignmentNotif.addEventListener('change', (e) => {
            const settings = getSettings();
            settings.assignmentNotif = e.target.checked;
            saveSettings(settings);
        });
    }

    if (classNotif) {
        classNotif.addEventListener('change', (e) => {
            const settings = getSettings();
            settings.classNotif = e.target.checked;
            saveSettings(settings);
        });
    }

    // Export data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllData);
    }

    // Clear data
    const clearBtn = document.getElementById('clearAllData');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
}

function exportAllData() {
    const data = {
        courses: getData('courses'),
        assignments: getData('assignments'),
        schedule: getData('schedule'),
        transactions: getData('transactions'),
        notes: getData('notes'),
        settings: getSettings(),
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-life-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL your data? This action cannot be undone!')) {
        if (confirm('This will delete all courses, assignments, notes, transactions, and settings. Continue?')) {
            localStorage.clear();
            alert('All data has been cleared.');
            location.reload();
        }
    }
}

// =====================================================
// INITIALIZE ON LOAD
// =====================================================

// Common initialization for all pages
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode on all pages
    initDarkMode();
});
