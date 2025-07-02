class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderProjects();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addProject() {
        const formData = {
            id: Date.now().toString(),
            name: document.getElementById('projectName').value,
            technology: document.getElementById('technology').value,
            priority: document.getElementById('priority').value,
            deadline: document.getElementById('deadline').value,
            description: document.getElementById('description').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.projects.push(formData);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        document.getElementById('projectForm').reset();

        // Animation d'ajout
        this.showNotification('Projet ajouté avec succès !', 'success');
    }

    deleteProject(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            this.projects = this.projects.filter(p => p.id !== id);
            this.saveProjects();
            this.renderProjects();
            this.updateStats();
            this.showNotification('Projet supprimé', 'info');
        }
    }

    toggleComplete(id) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.completed = !project.completed;
            this.saveProjects();
            this.renderProjects();
            this.updateStats();
            
            const status = project.completed ? 'terminé' : 'réactivé';
            this.showNotification(`Projet ${status} !`, 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderProjects();
    }

    getFilteredProjects() {
        switch (this.currentFilter) {
            case 'active':
                return this.projects.filter(p => !p.completed);
            case 'completed':
                return this.projects.filter(p => p.completed);
            case 'high':
            case 'medium':
            case 'low':
                return this.projects.filter(p => p.priority === this.currentFilter);
            default:
                return this.projects;
        }
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        const projects = this.getFilteredProjects();

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Aucun projet trouvé</h3>
                    <p>Essayez de changer les filtres ou ajoutez un nouveau projet.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
    }

    createProjectCard(project) {
        const priorityClass = `priority-${project.priority}`;
        const priorityBadgeClass = `priority-${project.priority}-badge`;
        const priorityIcon = project.priority === 'high' ? '🔴' : project.priority === 'medium' ? '🟡' : '🟢';
        
        const deadlineText = project.deadline ? 
            `📅 ${new Date(project.deadline).toLocaleDateString('fr-FR')}` : 
            '📅 Pas de deadline';

        const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !project.completed;

        return `
            <div class="project-card ${project.completed ? 'completed' : ''} ${priorityClass}">
                <div class="project-title">
                    ${project.name}
                    ${project.technology ? `<span style="color: #3498db; font-size: 0.8em;">(${project.technology})</span>` : ''}
                </div>
                
                <div class="project-description">
                    ${project.description || 'Aucune description'}
                </div>
                
                <div class="project-meta">
                    <div>
                        <span class="priority-badge ${priorityBadgeClass}">
                            ${priorityIcon} ${project.priority.toUpperCase()}
                        </span>
                        ${isOverdue ? '<span class="priority-badge priority-high-badge">⚠️ RETARD</span>' : ''}
                    </div>
                    <div class="status-badge">
                        ${deadlineText}
                    </div>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-complete" onclick="projectManager.toggleComplete('${project.id}')">
                        ${project.completed ? '↩️ Réactiver' : '✅ Terminer'}
                    </button>
                    <button class="btn btn-delete" onclick="projectManager.deleteProject('${project.id}')">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.projects.length;
        const active = this.projects.filter(p => !p.completed).length;
        const completed = this.projects.filter(p => p.completed).length;
        const highPriority = this.projects.filter(p => p.priority === 'high' && !p.completed).length;

        document.getElementById('totalProjects').textContent = total;
        document.getElementById('activeProjects').textContent = active;
        document.getElementById('completedProjects').textContent = completed;
        document.getElementById('highPriorityProjects').textContent = highPriority;
    }

    showNotification(message, type) {
        // Créer une notification toast
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveProjects() {
        // Stockage en mémoire pour cette session
        // (localStorage n'est pas disponible dans l'environnement Claude)
        this.projectsData = this.projects;
    }

    loadProjects() {
        // Retourner les données stockées en mémoire ou un tableau vide
        return this.projectsData || [];
    }
}

// Styles pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialiser l'application
const projectManager = new ProjectManager();

// Données de démonstration
if (projectManager.projects.length === 0) {
    projectManager.projects = [
        {
            id: '1',
            name: 'Site Portfolio Personnel',
            technology: 'React + Tailwind',
            priority: 'high',
            deadline: '2025-07-15',
            description: 'Créer un portfolio moderne pour présenter mes projets et compétences',
            completed: false,
            createdAt: '2025-07-01T10:00:00.000Z'
        },
        {
            id: '2',
            name: 'API REST E-commerce',
            technology: 'Node.js + Express',
            priority: 'medium',
            deadline: '2025-08-01',
            description: 'Développer une API complète pour une boutique en ligne avec authentification et paiement',
            completed: false,
            createdAt: '2025-07-02T09:00:00.000Z'
        },
        {
            id: '3',
            name: 'Script d\'automatisation',
            technology: 'Python',
            priority: 'low',
            deadline: '',
            description: 'Automatiser le backup des bases de données',
            completed: true,
            createdAt: '2025-06-28T14:00:00.000Z'
        }
    ];
    projectManager.renderProjects();
    projectManager.updateStats();
}