'use client';

import React, { useState } from 'react';

const WebsiteWindowsComponent = () => {
  const [activeWindow, setActiveWindow] = useState(0);
  const [windows, setWindows] = useState([
    {
      id: 0,
      title: 'Search',
      url: 'https://example.com/search',
      position: { x: 20, y: 20 },
      size: { width: 400, height: 300 },
      minimized: false
    },
    {
      id: 1,
      title: 'News',
      url: 'https://example.com/news',
      position: { x: 100, y: 80 },
      size: { width: 380, height: 280 },
      minimized: false
    },
    {
      id: 2,
      title: 'Email',
      url: 'https://example.com/email',
      position: { x: 180, y: 140 },
      size: { width: 420, height: 320 },
      minimized: false
    }
  ]);

  // For dragging windows
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedWindow, setDraggedWindow] = useState(null);

  const handleWindowClick = (id) => {
    setActiveWindow(id);
    // Bring to front by moving to end of array
    const newWindows = [...windows];
    const windowIndex = newWindows.findIndex(w => w.id === id);
    const windowToMove = newWindows.splice(windowIndex, 1)[0];
    newWindows.push(windowToMove);
    setWindows(newWindows);
  };

  const startDrag = (e, window) => {
    e.preventDefault();
    setDragging(true);
    setDraggedWindow(window.id);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
  };

  const onDrag = (e) => {
    if (dragging && draggedWindow !== null) {
      const newWindows = windows.map(w => {
        if (w.id === draggedWindow) {
          return {
            ...w,
            position: {
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            }
          };
        }
        return w;
      });
      setWindows(newWindows);
    }
  };

  const stopDrag = () => {
    setDragging(false);
    setDraggedWindow(null);
  };

  const toggleMinimize = (id) => {
    const newWindows = windows.map(w => {
      if (w.id === id) {
        return { ...w, minimized: !w.minimized };
      }
      return w;
    });
    setWindows(newWindows);
  };

  const closeWindow = (id) => {
    const newWindows = windows.filter(w => w.id !== id);
    setWindows(newWindows);
  };

  const addNewWindow = () => {
    const newId = Math.max(...windows.map(w => w.id)) + 1;
    const newWindow = {
      id: newId,
      title: `Window ${newId}`,
      url: 'https://example.com/new',
      position: { x: 50 + (newId * 30) % 200, y: 50 + (newId * 30) % 150 },
      size: { width: 400, height: 300 },
      minimized: false
    };
    setWindows([...windows, newWindow]);
    setActiveWindow(newId);
  };

  return (
    <div 
      className="relative w-full h-screen bg-black p-4 overflow-hidden"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Dock / Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex justify-between border-t border-gray-700">
        <div className="flex space-x-2">
          {windows.map(window => (
            <div 
              key={`dock-${window.id}`}
              className={`px-3 py-1 cursor-pointer ${activeWindow === window.id ? 'bg-white text-black' : 'bg-gray-800 text-white'} rounded`}
              onClick={() => {
                handleWindowClick(window.id);
                if (window.minimized) toggleMinimize(window.id);
              }}
            >
              {window.title}
            </div>
          ))}
        </div>
        <button 
          className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          onClick={addNewWindow}
        >
          + New Window
        </button>
      </div>

      {/* Windows */}
      {windows.map((window, index) => (
        <div 
          key={window.id}
          className={`absolute rounded border border-gray-600 bg-gray-900 shadow-lg ${window.minimized ? 'hidden' : 'block'} ${activeWindow === window.id ? 'ring-1 ring-white' : ''}`}
          style={{
            left: `${window.position.x}px`,
            top: `${window.position.y}px`,
            width: `${window.size.width}px`,
            height: `${window.size.height}px`,
            zIndex: activeWindow === window.id ? 50 : 10 + index
          }}
          onClick={() => handleWindowClick(window.id)}
        >
          {/* Window title bar */}
          <div 
            className="h-8 bg-gray-800 flex items-center justify-between px-2 rounded-t cursor-move"
            onMouseDown={(e) => startDrag(e, window)}
          >
            <div className="text-white font-medium truncate">{window.title}</div>
            <div className="flex space-x-2">
              <button 
                className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white"
                onClick={() => toggleMinimize(window.id)}
              >
                _
              </button>
              <button 
                className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white"
                onClick={() => closeWindow(window.id)}
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Website content */}
          <div className="p-2 bg-white h-full rounded-b overflow-hidden">
            {/* Simulated browser toolbar */}
            <div className="flex items-center space-x-2 mb-2 p-1 bg-gray-100 border border-gray-300 rounded">
              <button className="p-1 text-xs bg-gray-200 rounded">←</button>
              <button className="p-1 text-xs bg-gray-200 rounded">→</button>
              <button className="p-1 text-xs bg-gray-200 rounded">↻</button>
              <div className="flex-1 bg-white text-gray-800 text-sm px-2 py-1 border border-gray-300 rounded overflow-hidden truncate">
                {window.url}
              </div>
            </div>
            
            {/* Website placeholder content */}
            <div className="bg-gray-50 border border-gray-200 h-full p-4 overflow-auto">
              <h3 className="text-xl font-bold text-black mb-4">{window.title} Content</h3>
              <div className="space-y-4">
                <p className="text-gray-700">This is a simulated website content for {window.title}.</p>
                <div className="bg-white border border-gray-300 p-3 rounded">
                  <h4 className="font-medium text-black">Interactive Element</h4>
                  <div className="mt-2 flex flex-col space-y-2">
                    <input type="text" className="border border-gray-400 p-1 rounded" placeholder="Enter text..." />
                    <button className="bg-gray-800 text-white py-1 px-2 rounded">Submit</button>
                  </div>
                </div>
                <div className="flex space-x-4 overflow-x-auto py-2">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                      Item {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WebsiteWindowsComponent;