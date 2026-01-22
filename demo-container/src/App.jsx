import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, ExternalLink, X, Settings, Check, Monitor, AlertTriangle, Loader, Sun, Moon } from 'lucide-react';

const initialCategories = [
  {
    id: '1',
    name: 'Analytics',
    expanded: true,
    links: [
      { id: '1a', name: 'Dashboard', url: 'https://example.com/dashboard', openMode: 'app', iframeCompatible: true },
      { id: '1b', name: 'Reports', url: 'https://example.com/reports', openMode: 'app', iframeCompatible: true },
    ]
  },
  {
    id: '2',
    name: 'Partner Tools',
    expanded: false,
    links: [
      { id: '2a', name: 'White Label Portal', url: 'https://partner.example.com', openMode: 'app', iframeCompatible: true },
    ]
  },
  {
    id: '3',
    name: 'Internal Apps',
    expanded: false,
    links: [
      { id: '3a', name: 'CRM', url: 'https://crm.example.com', openMode: 'tab', iframeCompatible: false },
      { id: '3b', name: 'Inventory', url: 'https://inventory.example.com', openMode: 'app', iframeCompatible: true },
    ]
  }
];

// Theme configurations
const themes = {
  dark: {
    navBg: 'bg-gray-900',
    contentBg: 'bg-gray-800',
    text: 'text-gray-100',
    textMuted: 'text-gray-200',
    textSubtle: 'text-gray-300',
    inputBg: 'bg-gray-700',
    modalBg: 'bg-gray-800',
    border: 'border-gray-700',
    buttonBg: 'bg-gray-700 hover:bg-gray-600',
    hoverBg: 'hover:bg-gray-800',
    activeBg: 'bg-blue-600',
  },
  light: {
    navBg: 'bg-gray-100',
    contentBg: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-700',
    textSubtle: 'text-gray-500',
    inputBg: 'bg-white',
    modalBg: 'bg-white',
    border: 'border-gray-300',
    buttonBg: 'bg-gray-200 hover:bg-gray-300',
    hoverBg: 'hover:bg-gray-200',
    activeBg: 'bg-blue-500',
  }
};

// Iframe wrapper component with loading detection
function IframeWithFallback({ src, title, onIframeBlocked, darkMode }) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setBlocked(false);
    
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setBlocked(true);
        setLoading(false);
        onIframeBlocked?.();
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src]);

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
  };

  const handleError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBlocked(true);
    setLoading(false);
    onIframeBlocked?.();
  };

  if (blocked) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center p-6 max-w-md">
          <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Cannot Load in App
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This site doesn't allow embedding. It will open in a new tab instead.
          </p>
          <button
            onClick={() => window.open(src, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="text-center">
            <Loader size={32} className="text-blue-500 animate-spin mx-auto mb-3" />
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading application...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        className={`absolute inset-0 w-full h-full border-0 ${loading ? 'opacity-0' : 'opacity-100'}`}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

export default function AppLauncher() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeApp, setActiveApp] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddLink, setShowAddLink] = useState(null);
  const [newLink, setNewLink] = useState({ name: '', url: '', openMode: 'app', iframeCompatible: true });

  const theme = darkMode ? themes.dark : themes.light;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to initial categories if API fails
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = async (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    const newExpanded = !category.expanded;
    
    // Optimistically update UI
    setCategories(cats => cats.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: newExpanded } : cat
    ));
    
    // Update in database
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expanded: newExpanded })
      });
    } catch (error) {
      console.error('Error updating category:', error);
      // Revert on error
      setCategories(cats => cats.map(cat => 
        cat.id === categoryId ? { ...cat, expanded: !newExpanded } : cat
      ));
    }
  };

  const handleLinkClick = (link) => {
    if (link.openMode === 'tab' || !link.iframeCompatible) {
      window.open(link.url, '_blank');
    } else {
      setActiveApp(link);
    }
  };

  const markAsIframeBlocked = async (linkId) => {
    // Optimistically update UI
    setCategories(cats => cats.map(cat => ({
      ...cat,
      links: cat.links.map(link => 
        link.id === linkId ? { ...link, iframeCompatible: false } : link
      )
    })));
    
    // Update in database
    try {
      await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iframe_compatible: false })
      });
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const addCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName.trim(), expanded: true })
        });
        if (!response.ok) throw new Error('Failed to create category');
        const newCategory = await response.json();
        setCategories([...categories, { ...newCategory, links: [] }]);
        setNewCategoryName('');
        setShowAddCategory(false);
      } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category');
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    if (confirm('Delete this category and all its links?')) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete category');
        setCategories(cats => cats.filter(cat => cat.id !== categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const updateCategoryName = async (categoryId, newName) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (!response.ok) throw new Error('Failed to update category');
      setCategories(cats => cats.map(cat =>
        cat.id === categoryId ? { ...cat, name: newName } : cat
      ));
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const addLink = async (categoryId) => {
    if (newLink.name.trim() && newLink.url.trim()) {
      try {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: categoryId,
            name: newLink.name.trim(),
            url: newLink.url.trim(),
            open_mode: newLink.openMode,
            iframe_compatible: newLink.iframeCompatible
          })
        });
        if (!response.ok) throw new Error('Failed to create link');
        const newLinkData = await response.json();
        setCategories(cats => cats.map(cat =>
          cat.id === categoryId ? {
            ...cat,
            links: [...cat.links, {
              id: newLinkData.id,
              name: newLinkData.name,
              url: newLinkData.url,
              openMode: newLinkData.openMode,
              iframeCompatible: newLinkData.iframeCompatible
            }]
          } : cat
        ));
        setNewLink({ name: '', url: '', openMode: 'app', iframeCompatible: true });
        setShowAddLink(null);
      } catch (error) {
        console.error('Error creating link:', error);
        alert('Failed to create link');
      }
    }
  };

  const deleteLink = async (categoryId, linkId) => {
    if (confirm('Delete this link?')) {
      try {
        const response = await fetch(`/api/links/${linkId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete link');
        setCategories(cats => cats.map(cat =>
          cat.id === categoryId ? {
            ...cat,
            links: cat.links.filter(link => link.id !== linkId)
          } : cat
        ));
      } catch (error) {
        console.error('Error deleting link:', error);
        alert('Failed to delete link');
      }
    }
  };

  const updateLink = async (categoryId, linkId, updates) => {
    try {
      const updateData = {
        name: updates.name,
        url: updates.url,
        open_mode: updates.openMode,
        iframe_compatible: updates.iframeCompatible
      };
      
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update link');
      
      setCategories(cats => cats.map(cat =>
        cat.id === categoryId ? {
          ...cat,
          links: cat.links.map(link =>
            link.id === linkId ? { ...link, ...updates } : link
          )
        } : cat
      ));
    } catch (error) {
      console.error('Error updating link:', error);
      alert('Failed to update link');
    }
  };

  return (
    <div className={`flex h-screen ${theme.contentBg}`}>
      {/* Left Navigation */}
      <div className={`w-52 ${theme.navBg} flex flex-col border-r ${theme.border}`}>
        {/* Logo */}
        <div className={`p-3 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className={`font-semibold text-sm ${theme.text}`}>Repeatable AI</span>
          </div>
        </div>

        {/* Admin & Theme Toggle */}
        <div className={`px-3 py-2 border-b ${theme.border} flex items-center justify-between`}>
          <button
            onClick={() => setAdminMode(!adminMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
              adminMode ? 'bg-blue-600 text-white' : `${theme.buttonBg} ${theme.textMuted}`
            }`}
          >
            <Settings size={12} />
            Admin
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded transition-colors ${theme.buttonBg} ${theme.textMuted}`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={24} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            categories.map(category => (
            <div key={category.id} className="mb-1">
              {/* Category Header */}
              <div className="group flex items-center">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-1 flex-1 px-2 py-1.5 rounded ${theme.hoverBg} ${theme.textMuted} transition-colors`}
                >
                  {category.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      className={`${theme.inputBg} px-1 py-0.5 rounded ${theme.text} text-xs w-full`}
                      onBlur={(e) => updateCategoryName(category.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateCategoryName(category.id, e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="uppercase text-xs font-semibold tracking-wider truncate">{category.name}</span>
                  )}
                </button>
                {adminMode && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCategory(category.id); }}
                      className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                      title="Edit category"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                      title="Delete category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Links */}
              {category.expanded && (
                <div className="ml-3">
                  {category.links.map(link => (
                    <div key={link.id} className="group relative flex items-center">
                      <button
                        onClick={() => !adminMode && handleLinkClick(link)}
                        className={`flex items-center gap-1.5 flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                          activeApp?.id === link.id
                            ? `${theme.activeBg} text-white`
                            : `${theme.hoverBg} ${theme.text}`
                        }`}
                      >
                        {link.openMode === 'tab' || !link.iframeCompatible ? (
                          <ExternalLink size={12} className={theme.textSubtle} />
                        ) : (
                          <Monitor size={12} className={theme.textSubtle} />
                        )}
                        <span className="truncate">{link.name}</span>
                      </button>
                      {adminMode && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const cat = categories.find(c => c.links.some(l => l.id === link.id));
                              setEditingLink({ categoryId: cat.id, link: { ...link } });
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                            title="Edit link"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLink(category.id, link.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                            title="Delete link"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Link Button */}
                  {adminMode && (
                    showAddLink === category.id ? (
                      <div className={`p-2 ${theme.inputBg} rounded mt-1`}>
                        <input
                          type="text"
                          placeholder="Link name"
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                          className={`w-full ${theme.inputBg} border ${theme.border} px-2 py-1 rounded text-xs ${theme.text} mb-1`}
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                          className={`w-full ${theme.inputBg} border ${theme.border} px-2 py-1 rounded text-xs ${theme.text} mb-1`}
                        />
                        <div className="flex gap-1 mb-1">
                          <button
                            onClick={() => setNewLink({ ...newLink, openMode: 'app' })}
                            className={`flex-1 px-2 py-1 text-xs rounded ${
                              newLink.openMode === 'app' ? 'bg-blue-600 text-white' : `${theme.buttonBg} ${theme.textMuted}`
                            }`}
                          >
                            In App
                          </button>
                          <button
                            onClick={() => setNewLink({ ...newLink, openMode: 'tab' })}
                            className={`flex-1 px-2 py-1 text-xs rounded ${
                              newLink.openMode === 'tab' ? 'bg-blue-600 text-white' : `${theme.buttonBg} ${theme.textMuted}`
                            }`}
                          >
                            New Tab
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowAddLink(null)}
                            className={`flex-1 px-2 py-1 text-xs ${theme.buttonBg} rounded ${theme.textMuted}`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => addLink(category.id)}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddLink(category.id)}
                        className={`flex items-center gap-1 w-full px-2 py-1 text-xs ${theme.textSubtle} ${theme.hoverBg} rounded mt-1`}
                      >
                        <Plus size={12} />
                        Add Link
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          )))}

          {/* Add Category */}
          {adminMode && (
            showAddCategory ? (
              <div className={`p-2 ${theme.inputBg} rounded`}>
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={`w-full ${theme.inputBg} border ${theme.border} px-2 py-1 rounded text-xs ${theme.text} mb-1`}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className={`flex-1 px-2 py-1 text-xs ${theme.buttonBg} rounded ${theme.textMuted}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCategory}
                    className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCategory(true)}
                className={`flex items-center gap-1 w-full px-2 py-1.5 text-xs ${theme.textSubtle} ${theme.hoverBg} rounded`}
              >
                <Plus size={12} />
                Add Category
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {activeApp ? (
          <>
            {/* App Header */}
            <div className={`absolute top-0 left-0 right-0 h-10 ${theme.navBg} border-b ${theme.border} flex items-center justify-between px-3 z-10`}>
              <span className={`font-medium text-sm ${theme.text}`}>{activeApp.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(activeApp.url, '_blank')}
                  className={`p-1.5 ${theme.buttonBg} rounded ${theme.textMuted}`}
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={() => setActiveApp(null)}
                  className={`p-1.5 ${theme.buttonBg} rounded ${theme.textMuted}`}
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {/* App Content */}
            <div className="absolute top-10 left-0 right-0 bottom-0">
              <IframeWithFallback
                src={activeApp.url}
                title={activeApp.name}
                onIframeBlocked={() => markAsIframeBlocked(activeApp.id)}
                darkMode={darkMode}
              />
            </div>
          </>
        ) : (
          <div className={`flex items-center justify-center h-full ${theme.textSubtle}`}>
            <div className="text-center">
              <Monitor size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an app from the sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${theme.modalBg} p-4 rounded-lg w-80 shadow-xl`}>
            <h3 className={`font-semibold mb-3 ${theme.text}`}>Edit Link</h3>
            
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${theme.textSubtle} block mb-1`}>Name</label>
                <input
                  type="text"
                  value={editingLink.link.name}
                  onChange={(e) => setEditingLink({
                    ...editingLink,
                    link: { ...editingLink.link, name: e.target.value }
                  })}
                  className={`w-full ${theme.inputBg} border ${theme.border} px-2 py-1.5 rounded text-sm ${theme.text}`}
                />
              </div>
              
              <div>
                <label className={`text-xs ${theme.textSubtle} block mb-1`}>URL</label>
                <input
                  type="text"
                  value={editingLink.link.url}
                  onChange={(e) => setEditingLink({
                    ...editingLink,
                    link: { ...editingLink.link, url: e.target.value }
                  })}
                  className={`w-full ${theme.inputBg} border ${theme.border} px-2 py-1.5 rounded text-sm ${theme.text}`}
                />
              </div>
              
              <div>
                <label className={`text-xs ${theme.textSubtle} block mb-1`}>Open Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLink({
                      ...editingLink,
                      link: { ...editingLink.link, openMode: 'app' }
                    })}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded transition-colors ${
                      editingLink.link.openMode === 'app' ? 'bg-blue-600 text-white' : `${theme.buttonBg} ${theme.textMuted}`
                    }`}
                  >
                    <Monitor size={16} />
                    In App
                  </button>
                  <button
                    onClick={() => setEditingLink({
                      ...editingLink,
                      link: { ...editingLink.link, openMode: 'tab' }
                    })}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded transition-colors ${
                      editingLink.link.openMode === 'tab' ? 'bg-blue-600 text-white' : `${theme.buttonBg} ${theme.textMuted}`
                    }`}
                  >
                    <ExternalLink size={16} />
                    Open in Tab
                  </button>
                </div>
              </div>
              
              {editingLink.link.openMode === 'app' && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEditingLink({
                        ...editingLink,
                        link: { ...editingLink.link, iframeCompatible: !editingLink.link.iframeCompatible }
                      })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        editingLink.link.iframeCompatible ? 'bg-green-600' : 'bg-yellow-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${
                        editingLink.link.iframeCompatible ? 'translate-x-4' : ''
                      }`} />
                    </div>
                    <div>
                      <span className={`text-sm ${theme.text}`}>
                        {editingLink.link.iframeCompatible ? 'Iframe Compatible' : 'Not Iframe Compatible'}
                      </span>
                      <span className={`text-xs ${theme.textSubtle} block mt-0.5`}>
                        {editingLink.link.iframeCompatible 
                          ? 'Will try to load in app. If blocked, will show fallback.'
                          : 'Will always open in new tab (use for login pages, etc.)'}
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingLink(null)}
                className={`flex-1 px-3 py-2 text-sm ${theme.buttonBg} rounded transition-colors ${theme.text}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateLink(editingLink.categoryId, editingLink.link.id, editingLink.link);
                  setEditingLink(null);
                }}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
