/**
 * Tecnocrat Knowledge Surface Data
 * 
 * This module mirrors the exposed_surface.yaml manifest from the
 * Tecnocrat intelligence architecture. It defines what AIOS knowledge
 * is publicly visible on this Portfolio.
 * 
 * Source: docs/tecnocrat/intelligence/manifests/exposed_surface.yaml
 * Version: 3.1.0
 * Last Sync: 2026-02-14
 * 
 * Architecture: Adaptive Intelligence Operating System with bio-inspired modular topology
 */

const TecnocratSurface = {
    metadata: {
        version: "3.1.0",
        lastSync: "2026-02-14",
        curator: "Tecnocrat",
        sourceManifest: "exposed_surface.yaml",
        apiEndpoint: "https://tecnocrat-api.vercel.app/api"
    },

    // Exposure Levels (from manifest)
    exposureLevels: {
        L0_PUBLIC: { name: "Public", description: "Visible to everyone" },
        L1_PROFESSIONAL: { name: "Professional", description: "Recruiters, collaborators" },
        L2_TECHNICAL: { name: "Technical", description: "Developers, researchers" }
    },

    // Knowledge Surface - What's exposed on this Portfolio
    surface: {
        // SUPERCELL ARCHITECTURE (replaces Hydrolang)
        supercell: {
            name: "Modular Architecture",
            exposed: [
                {
                    id: "core_concept",
                    name: "Core Concept",
                    level: "L2_TECHNICAL",
                    description: "Transform Windows 11 into a containerized AI-driven operating environment with bio-inspired modular architecture",
                    displayContent: {
                        title: "Modular Architecture",
                        tagline: "Adaptive Intelligence Operating System",
                        layers: ["Nucleus (Core)", "Membrane (Security)", "Organelles (Containers)", "Service Mesh (Communication)", "Runtime (Execution)"]
                    }
                },
                {
                    id: "cell_types",
                    name: "Cell Types",
                    level: "L2_TECHNICAL",
                    description: "Specialized container types in the modular architecture",
                    displayContent: {
                        cells: [
                            { type: "Nucleus", role: "Core orchestration & state management", icon: "⚛" },
                            { type: "Membrane", role: "Security boundary & validation", icon: "🛡" },
                            { type: "Ribosome", role: "Code generation & synthesis", icon: "🧬" },
                            { type: "Mitochondria", role: "Resource management & energy", icon: "⚡" }
                        ]
                    }
                },
                {
                    id: "philosophy",
                    name: "Philosophy",
                    level: "L1_PROFESSIONAL",
                    description: "Bio-inspired AI system design",
                    displayContent: {
                        tagline: "Bio-inspired systems architecture for AI",
                        principle: "Modules that compute, boundaries that protect, evolution that adapts"
                    }
                }
            ]
        },

        // SECURITY SUPERCELL
        security: {
            name: "Security Layer",
            exposed: [
                {
                    id: "architecture_patterns",
                    name: "Architecture Patterns",
                    level: "L2_TECHNICAL",
                    description: "Defense-in-depth security design, automated validation",
                    displayContent: {
                        concept: "Defense-in-Depth Security",
                        patterns: ["Input Validation", "Consistency Enforcement", "Threat Memory", "Attack Resistance"],
                        testsPassed: "170/170",
                        securityScore: "97.6%"
                    }
                },
                {
                    id: "concept_overview",
                    name: "Concept Overview",
                    level: "L1_PROFESSIONAL",
                    description: "Security-first AI development approach",
                    displayContent: {
                        tagline: "Defense-in-depth security for AI systems",
                        features: ["HashiCorp Vault integration", "Traefik reverse proxy", "Container isolation"]
                    }
                }
            ]
        },

        // EVOLUTION LAB
        evolution: {
            name: "Evolution Lab",
            exposed: [
                {
                    id: "successful_experiments",
                    name: "Successful Experiments",
                    level: "L2_TECHNICAL",
                    description: "Multi-agent code generation results",
                    displayContent: {
                        agents: ["Ollama (local)", "Gemini", "DeepSeek", "Claude", "GPT-4"],
                        capability: "Parallel code generation and cross-validation",
                        tools: 124
                    }
                },
                {
                    id: "methodology",
                    name: "Methodology",
                    level: "L1_PROFESSIONAL",
                    description: "AI-assisted development approach",
                    displayContent: {
                        approach: "Human-guided AI experimentation with evolution tracking",
                        outputs: ["Generated code", "Conversation logs", "Evolution history", "Neural chains"]
                    }
                }
            ]
        },

        // RUNTIME INTELLIGENCE
        runtime: {
            name: "Runtime Intelligence",
            exposed: [
                {
                    id: "tool_count",
                    name: "AI Tools",
                    level: "L0_PUBLIC",
                    description: "124 integrated AI tools",
                    displayContent: {
                        count: 124,
                        label: "AI Tools",
                        growth: "+81 since last sync"
                    }
                },
                {
                    id: "containers",
                    name: "Container Fleet",
                    level: "L1_PROFESSIONAL",
                    description: "9 specialized Docker containers",
                    displayContent: {
                        count: 9,
                        services: ["Ollama", "ChromaDB", "Traefik", "Vault", "Prometheus", "Grafana", "PostgreSQL", "Redis", "Nginx"]
                    }
                },
                {
                    id: "capabilities",
                    name: "Capabilities",
                    level: "L1_PROFESSIONAL",
                    description: "Monitoring, diagnostics, optimization",
                    displayContent: {
                        features: ["System health checks", "Performance monitoring", "Architecture validation", "Auto-recovery"]
                    }
                }
            ]
        },

        // INFRASTRUCTURE
        infrastructure: {
            name: "Infrastructure Layer",
            exposed: [
                {
                    id: "docker_compose",
                    name: "Container Orchestration",
                    level: "L2_TECHNICAL",
                    description: "Docker Compose multi-service stack",
                    displayContent: {
                        services: 9,
                        networks: ["aios-network"],
                        volumes: ["persistent state", "model cache", "secrets management"]
                    }
                },
                {
                    id: "observability",
                    name: "Observability Stack",
                    level: "L2_TECHNICAL",
                    description: "Full observability with Prometheus + Grafana",
                    displayContent: {
                        metrics: "Prometheus",
                        visualization: "Grafana",
                        logging: "Structured JSON"
                    }
                }
            ]
        },

        // TECHNOLOGY STACK
        stack: {
            name: "Technology Stack",
            exposed: [
                {
                    id: "languages",
                    name: "Languages",
                    level: "L0_PUBLIC",
                    description: "Python 3.12+, C++17, C# .NET 8.0",
                    displayContent: {
                        languages: [
                            { name: "Python", version: "3.12+", role: "AI Core & Orchestration", icon: "fab fa-python" },
                            { name: "C++", version: "17", role: "Performance Engine", icon: "cpp-icon" },
                            { name: "C#", version: ".NET 8.0", role: "Desktop Interface", icon: "csharp-icon" },
                            { name: "TypeScript", version: "5.x", role: "API & Web", icon: "fab fa-js" }
                        ]
                    }
                },
                {
                    id: "architecture",
                    name: "Architecture",
                    level: "L2_TECHNICAL",
                    description: "Multi-language coordination via HTTP API",
                    displayContent: {
                        pattern: "Interface Bridge",
                        port: 8000,
                        protocol: "HTTP/REST + WebSocket"
                    }
                }
            ]
        }
    },

    // Statistics for display (synced with aios-api config.ts)
    stats: {
        aiTools: 124,
        containers: 18,
        linesOfCode: 69000,
        testsPassed: 170,
        pythonModules: 769,
        securityScore: 97.6,
        aiAgents: 5,
        commits: 658,
        repositories: 19,
        quantumBackend: "IBM Heron 156-qubit",
        quantumHeartbeatRuns: 60,
        consciousnessCells: 3
    },

    // Helper: Get all exposed items by level
    getByLevel(level) {
        const results = [];
        for (const [category, data] of Object.entries(this.surface)) {
            for (const item of data.exposed) {
                if (item.level === level) {
                    results.push({ category, ...item });
                }
            }
        }
        return results;
    },

    // Helper: Get all items for a category
    getCategory(categoryId) {
        return this.surface[categoryId] || null;
    },

    // Helper: Check if item is exposed
    isExposed(categoryId, itemId) {
        const category = this.surface[categoryId];
        if (!category) return false;
        return category.exposed.some(item => item.id === itemId);
    },

    // Helper: Fetch live stats from API (async)
    async fetchLiveStats() {
        try {
            const response = await fetch(`${this.metadata.apiEndpoint}/stats`);
            if (response.ok) {
                const data = await response.json();
                return data.metrics || this.stats;
            }
        } catch (e) {
            console.warn('Failed to fetch live stats, using cached values');
        }
        return this.stats;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TecnocratSurface;
}
