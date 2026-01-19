/**
 * Project Templates for CodeGenesis
 * Pre-built starter templates for common app types
 */

export interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: "web" | "dashboard" | "landing" | "ecommerce" | "saas";
    techStack: string[];
    files: Record<string, string>;
    preview?: string;
}

export const TEMPLATES: Template[] = [
    {
        id: "landing-modern",
        name: "Modern Landing Page",
        description: "A sleek, animated landing page with hero section, features, and CTA",
        icon: "🚀",
        category: "landing",
        techStack: ["React", "Tailwind CSS", "Framer Motion"],
        files: {
            "/App.tsx": `import React from 'react';
import { motion } from 'framer-motion';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Build 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              {" "}Amazing{" "}
            </span>
            Products
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            The modern platform for building beautiful, fast, and scalable applications.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-medium transition-colors">
              Get Started Free
            </button>
            <button className="px-8 py-3 border border-white/20 hover:bg-white/10 rounded-full font-medium transition-colors">
              View Demo
            </button>
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: "⚡", title: "Lightning Fast", description: "Optimized for speed and performance" },
  { icon: "🎨", title: "Beautiful Design", description: "Modern UI with attention to detail" },
  { icon: "🔒", title: "Secure by Default", description: "Enterprise-grade security built in" },
];`,
            "/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
}`,
        },
    },
    {
        id: "dashboard-analytics",
        name: "Analytics Dashboard",
        description: "A clean dashboard with charts, stats cards, and data tables",
        icon: "📊",
        category: "dashboard",
        techStack: ["React", "Tailwind CSS", "Recharts"],
        files: {
            "/App.tsx": `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-white/10 p-4">
        <div className="text-xl font-bold mb-8 flex items-center gap-2">
          📊 Analytics
        </div>
        <nav className="space-y-2">
          {['Dashboard', 'Reports', 'Users', 'Settings'].map(item => (
            <a key={item} href="#" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="p-6 rounded-xl bg-slate-800 border border-white/10">
              <div className="text-white/60 text-sm mb-1">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className={\`text-sm \${stat.change > 0 ? 'text-green-400' : 'text-red-400'}\`}>
                {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
              </div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="p-6 rounded-xl bg-slate-800 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <div className="h-64 flex items-center justify-center text-white/30">
            📈 Chart goes here (add Recharts)
          </div>
        </div>
      </main>
    </div>
  );
}

const stats = [
  { label: 'Total Revenue', value: '$45,231', change: 12 },
  { label: 'Active Users', value: '2,350', change: 8 },
  { label: 'Conversion Rate', value: '3.2%', change: -2 },
  { label: 'Avg. Order', value: '$89', change: 5 },
];`,
            "/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        },
    },
    {
        id: "todo-app",
        name: "Todo Application",
        description: "A feature-complete todo app with filters and local storage",
        icon: "✅",
        category: "web",
        techStack: ["React", "Tailwind CSS", "TypeScript"],
        files: {
            "/App.tsx": `import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">✅ Todo App</h1>
        
        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-400"
          />
          <button
            onClick={addTodo}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg capitalize \${filter === f ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}\`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/10"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 rounded"
              />
              <span className={\`flex-1 \${todo.completed ? 'line-through text-white/40' : 'text-white'}\`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 text-white/50 text-sm text-center">
          {todos.filter(t => !t.completed).length} items left
        </div>
      </div>
    </div>
  );
}`,
            "/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        },
    },
    {
        id: "ecommerce-product",
        name: "Product Page",
        description: "A beautiful e-commerce product page with gallery and variants",
        icon: "🛍️",
        category: "ecommerce",
        techStack: ["React", "Tailwind CSS"],
        files: {
            "/App.tsx": `import React, { useState } from 'react';

export default function App() {
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
            <span className="text-8xl">👟</span>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-purple-600 font-medium mb-2">Premium Collection</p>
              <h1 className="text-4xl font-bold text-gray-900">Classic Sneakers</h1>
              <p className="text-3xl font-bold text-gray-900 mt-4">$129.00</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Timeless design meets modern comfort. These premium sneakers feature 
              a breathable mesh upper and cushioned sole for all-day wear.
            </p>

            {/* Color Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Color</p>
              <div className="flex gap-3">
                {['black', 'white', 'red'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={\`w-10 h-10 rounded-full border-2 \${selectedColor === color ? 'border-purple-600' : 'border-transparent'}\`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Size</p>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={\`w-12 h-12 rounded-lg border \${
                      selectedSize === size 
                        ? 'border-purple-600 bg-purple-50 text-purple-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }\`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                Add to Cart
              </button>
              <button className="px-6 py-4 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
            "/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        },
    },
];

export function getTemplateById(id: string): Template | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: Template["category"]): Template[] {
    return TEMPLATES.filter(t => t.category === category);
}

export default TEMPLATES;
