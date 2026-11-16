document.addEventListener("DOMContentLoaded", () => {
    injectLayout();
    initTheme();

    // Load featured projects if on index.html
    const featuredContainer = document.getElementById("featured-projects");
    if (featuredContainer) {
        loadProjects(featuredContainer, { featuredOnly: true });
    }

    // Load all filterable projects if on projects.html
    const allProjectsContainer = document.getElementById("projects-grid");
    if (allProjectsContainer) {
        loadProjects(allProjectsContainer, { featuredOnly: false });
    }
});

/* 1. Shared Navbar & Footer Injection */
function injectLayout() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const navItems = [
        { name: "Home", href: "index.html" },
        { name: "Projects", href: "projects.html" },
        { name: "Art", href: "gallery.html" },
        { name: "Music", href: "music.html" },
        { name: "Lab & Weird Stuff", href: "lab.html" }
    ];

    const linksHtml = navItems.map(item => {
        const isActive = currentPage === item.href ? "active" : "";
        return `<a href="${item.href}" class="${isActive}">${item.name}</a>`;
    }).join("");

    const header = document.getElementById("site-header");
    if (header) {
        header.innerHTML = `
            <div class="container nav-bar">
                <a href="index.html" class="brand">Derek Wong</a>
                <nav class="nav-links">
                    ${linksHtml}
                    <button id="theme-toggle" class="theme-btn" aria-label="Toggle theme">Theme</button>
                </nav>
            </div>
        `;
    }

    const footer = document.getElementById("site-footer");
    if (footer) {
        footer.innerHTML = `
            <div class="container">
                <p>&copy; ${new Date().getFullYear()} Derek Wong &bull; Built with HTML, CSS & JS on GitHub Pages</p>
            </div>
        `;
    }
}

/* 2. Dark / Light Theme Toggle */
function initTheme() {
    const savedTheme = localStorage.getItem("portfolio-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    toggleBtn.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";

    toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("portfolio-theme", next);
        toggleBtn.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
    });
}

/* 3. Fetch & Render Projects */
async function loadProjects(container, { featuredOnly }) {
    try {
        const response = await fetch("data/portfolio.json");
        if (!response.ok) throw new Error("Failed to load portfolio.json");

        const data = await response.json();
        let projects = data.projects || [];

        if (featuredOnly) {
            projects = projects.filter(p => p.featured);
            renderCards(container, projects);
        } else {
            setupFilters(container, projects);
            renderCards(container, projects);
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color: var(--text-muted);">Unable to load projects. If testing locally, run via a local server (e.g., VS Code Live Server) so <code>fetch()</code> can read <code>data/portfolio.json</code>.</p>`;
    }
}

function renderCards(container, projects) {
    if (projects.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">No projects found in this category.</p>`;
        return;
    }

    container.innerHTML = projects.map(project => {
        const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
        
        const repoLink = project.repoUrl 
            ? `<a href="${project.repoUrl}" target="_blank" rel="noopener">GitHub Repo &rarr;</a>` 
            : "";
        const demoLink = project.demoUrl 
            ? `<a href="${project.demoUrl}" target="_blank" rel="noopener">Live Demo &rarr;</a>` 
            : "";

        return `
            <article class="card">
                <div>
                    <div class="card-meta">
                        <span>${project.category}</span>
                        <span>${project.date}</span>
                    </div>
                    <h3>${project.title}</h3>
                    <p>${project.summary}</p>
                </div>
                <div>
                    <div class="tags">${tagsHtml}</div>
                    ${(repoLink || demoLink) ? `<div class="card-links">${repoLink}${demoLink}</div>` : ""}
                </div>
            </article>
        `;
    }).join("");
}

function setupFilters(container, allProjects) {
    const filterBar = document.getElementById("filter-bar");
    if (!filterBar) return;

    const categories = ["All", ...new Set(allProjects.map(p => p.category))];

    filterBar.innerHTML = categories.map((cat, index) => `
        <button class="filter-btn ${index === 0 ? "active" : ""}" data-category="${cat}">
            ${cat}
        </button>
    `).join("");

    filterBar.addEventListener("click", (e) => {
        if (!e.target.classList.contains("filter-btn")) return;

        document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        const selected = e.target.getAttribute("data-category");
        const filtered = selected === "All" 
            ? allProjects 
            : allProjects.filter(p => p.category === selected);

        renderCards(container, filtered);
    });
}
