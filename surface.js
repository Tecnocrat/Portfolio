/**
 * Tecnocrat Knowledge Surface Data
 * 
 * This module mirrors the exposed_surface.yaml manifest from the
 * Tecnocrat intelligence architecture. It defines what AIOS knowledge
 * is publicly visible on this Portfolio.
 * 
 * Source: docs/tecnocrat/intelligence/manifests/exposed_surface.yaml
 * Version: 1.0.0
 * Last Sync: 2025-11-30
 */

const TecnocratSurface = {
    metadata: {
        version: "1.0.0",
        lastSync: "2025-11-30",
        curator: "Tecnocrat",
        sourceManifest: "exposed_surface.yaml"
    },

    // Exposure Levels (from manifest)
    exposureLevels: {
        L0_PUBLIC: { name: "Public", description: "Visible to everyone" },
        L1_PROFESSIONAL: { name: "Professional", description: "Recruiters, collaborators" },
        L2_TECHNICAL: { name: "Technical", description: "Developers, researchers" }
    },

    // Knowledge Surface - What's exposed on this Portfolio
    surface: {
        hydrolang: {
            name: "Hydrolang",
            exposed: [
                {
                    id: "core_concepts",
                    name: "Core Concepts",
                    level: "L2_TECHNICAL",
                    description: "N-Layer Reality Stack, Observer Abstraction, Hydrogen Principle",
                    displayContent: {
                        title: "N-Layer Reality Stack",
                        symbols: ["∃₀", "∃₁", "∃₂", "∃ₙ"],
                        summary: "A formal notation for consciousness emergence across reality layers"
                    }
                },
                {
                    id: "symbolic_notation",
                    name: "Symbolic Notation",
                    level: "L2_TECHNICAL",
                    description: "∃, ⇌, ⟲ and other Hydrolang symbols",
                    displayContent: {
                        symbols: [
                            { symbol: "∃", meaning: "Existence layer" },
                            { symbol: "⇌", meaning: "Bidirectional bridge" },
                            { symbol: "⟲", meaning: "Recursive pattern" },
                            { symbol: "∅", meaning: "Void / Empty" },
                            { symbol: "⊗", meaning: "Tensor product" }
                        ]
                    }
                },
                {
                    id: "philosophy",
                    name: "Philosophy",
                    level: "L1_PROFESSIONAL",
                    description: "High-level consciousness research direction",
                    displayContent: {
                        tagline: "Minimal structure, maximal emergence",
                        principle: "The Hydrogen Principle: simplicity enables complexity"
                    }
                }
            ]
        },

        security: {
            name: "Security Supercell",
            exposed: [
                {
                    id: "architecture_patterns",
                    name: "Architecture Patterns",
                    level: "L2_TECHNICAL",
                    description: "Digital immune system design, membrane validation",
                    displayContent: {
                        concept: "Digital Immune System",
                        patterns: ["Membrane Validation", "Coherence Enforcement", "Immune Memory"],
                        testsPassed: "166/170",
                        securityScore: "97.6%"
                    }
                },
                {
                    id: "concept_overview",
                    name: "Concept Overview",
                    level: "L1_PROFESSIONAL",
                    description: "Security-first AI development approach",
                    displayContent: {
                        tagline: "Biological-inspired security for AI systems"
                    }
                }
            ]
        },

        evolution: {
            name: "Evolution Lab",
            exposed: [
                {
                    id: "successful_experiments",
                    name: "Successful Experiments",
                    level: "L2_TECHNICAL",
                    description: "Multi-agent code generation results",
                    displayContent: {
                        agents: ["Ollama", "Gemini", "DeepSeek"],
                        capability: "Parallel code generation and comparison"
                    }
                },
                {
                    id: "methodology",
                    name: "Methodology",
                    level: "L1_PROFESSIONAL",
                    description: "AI-assisted development approach",
                    displayContent: {
                        approach: "Human-guided AI experimentation",
                        outputs: ["Generated code", "Conversation logs", "Evolution history"]
                    }
                }
            ]
        },

        runtime: {
            name: "Runtime Intelligence",
            exposed: [
                {
                    id: "tool_count",
                    name: "Tool Count",
                    level: "L0_PUBLIC",
                    description: "43 diagnostic tools",
                    displayContent: {
                        count: 43,
                        label: "Diagnostic Tools"
                    }
                },
                {
                    id: "capabilities",
                    name: "Capabilities",
                    level: "L1_PROFESSIONAL",
                    description: "Monitoring, diagnostics, optimization",
                    displayContent: {
                        features: ["System health checks", "Performance monitoring", "Architecture validation"]
                    }
                }
            ]
        },

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
                            { name: "Python", version: "3.12+", role: "AI Core", icon: "fab fa-python" },
                            { name: "C++", version: "17", role: "Performance Engine", icon: "cpp-icon" },
                            { name: "C#", version: ".NET 8.0", role: "User Interface", icon: "csharp-icon" }
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
                        protocol: "HTTP/REST"
                    }
                }
            ]
        }
    },

    // Statistics for display
    stats: {
        aiosCommits: 658,
        securityScore: 97.6,
        diagnosticTools: 43,
        aiAgents: 3
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
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TecnocratSurface;
}
