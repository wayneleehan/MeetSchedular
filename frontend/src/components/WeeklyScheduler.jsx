import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/slots';

const WeeklyScheduler = ({ username, onLogout }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 - 21:00

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // ★ 新增：拖曳相關狀態
  const isDragging = useRef(false); // 使用 ref 來即時追蹤拖曳狀態 (比 state 更快)
  const dragMode = useRef(null);    // 'add' (新增) 或 'remove' (移除)

  // 1. 載入資料
  const fetchSlots = async () => {
    try {
      const res = await axios.get(API_URL);
      setSlots(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 2000);
    
    // ★ 防止滑鼠拖曳到視窗外放開後，狀態卡住
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
      dragMode.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // 2. 資料處理
  const gridData = useMemo(() => {
    const map = {};
    slots.forEach(slot => {
      const key = `${slot.dayIndex}-${slot.hour}`;
      if (!map[key]) {
        map[key] = { count: 0, mySlotId: null, users: [] };
      }
      map[key].count += 1;
      map[key].users.push(slot.username);
      if (slot.username === username) {
        map[key].mySlotId = slot.id;
      }
    });
    return map;
  }, [slots, username]);

  // 3. API 互動 (核心修改)
  // forceAction: 強制指定 'add' 或 'remove'，如果為 undefined 則自動切換
  const handleInteract = async (dayIndex, hour, forceAction = undefined) => {
    const key = `${dayIndex}-${hour}`;
    const cellData = gridData[key];
    const isCurrentlySelected = cellData && cellData.mySlotId;

    // 決定要執行的動作
    let action = forceAction;
    if (!action) {
      action = isCurrentlySelected ? 'remove' : 'add';
    }

    // 優化：如果動作跟現況一樣 (例如已經選了，還想再選)，就跳過 API 呼叫，節省流量
    if (action === 'add' && isCurrentlySelected) return;
    if (action === 'remove' && !isCurrentlySelected) return;

    // 樂觀更新 (Optimistic UI): 雖然這裡沒做完整的本地狀態模擬，但我們可以防止重複發送
    // 實際專案建議在這裡先 setSlots 更新本地畫面，再發送請求

    try {
      if (action === 'remove' && cellData?.mySlotId) {
        await axios.delete(`${API_URL}/${cellData.mySlotId}`);
      } else if (action === 'add') {
        await axios.post(API_URL, {
          dayIndex,
          hour,
          username
        });
      }
      await fetchSlots(); // 更新畫面
    } catch (err) {
      console.error(err);
    }
  };

  // ★ 滑鼠事件處理
  const onMouseDown = (dayIndex, hour) => {
    isDragging.current = true;
    
    // 判斷起始格子的狀態，決定這次拖曳是要「全部選取」還是「全部取消」
    const key = `${dayIndex}-${hour}`;
    const isSelected = gridData[key]?.mySlotId;
    dragMode.current = isSelected ? 'remove' : 'add';

    handleInteract(dayIndex, hour, dragMode.current);
  };

  const onMouseEnter = (dayIndex, hour) => {
    if (!isDragging.current) return;
    handleInteract(dayIndex, hour, dragMode.current);
  };

  // 4. 顏色計算 (綠色 20 層級)
  const getCellStyle = (count, isSelected) => {
    // 基礎邏輯：沒人選就是透明/白色
    if (count === 0) return {};

    const maxCapacity = 20;
    
    // 如果是我選的，給一個最低保底亮度，讓使用者知道自己有選
    // 比如：如果我選了，但目前只有 1 人(就是我)，透明度 0.05 會太淡看不到，所以保底 0.3
    let opacity = Math.min(Math.max(count / maxCapacity, 0.1), 1);
    
    if (isSelected) {
        // 如果是我選的，稍微加深一點點，確保視覺上有感
        opacity = Math.max(opacity, 0.4); 
    }

    return {
      backgroundColor: `rgba(22, 163, 74, ${opacity})` // Green-600
    };
  };

  return (
    <div className="p-4 max-w-6xl mx-auto select-none"> {/* select-none 防止拖曳時反白文字 */}
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Scheduler</h1>
          <p className="text-gray-500 mt-1">
            你好，<span className="font-bold text-green-700">{username}</span>
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <button onClick={onLogout} className="text-sm text-gray-400 hover:text-red-500 underline">
                登出
            </button>
            <div className="flex gap-4 text-xs mt-2">
                <div className="flex items-center">
                   {/* 為了圖例清楚，這裡保留一點外框，但實際表格內會移除 */}
                   <div className="w-4 h-4 bg-green-600 opacity-40 mr-2 rounded"></div> 
                   顏色越深代表越多人
                </div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-0 border-t border-l border-gray-200 shadow-sm">
        
        {/* Header - Empty */}
        <div className="h-10 bg-gray-50 border-r border-b border-gray-200"></div>
        
        {/* Header - Days */}
        {days.map(day => (
          <div key={day} className="h-10 flex items-center justify-center font-bold text-gray-600 bg-gray-50 border-r border-b border-gray-200">
            {day}
          </div>
        ))}

        {/* Rows */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            {/* Time Label */}
            <div className="h-12 flex items-center justify-center text-sm text-gray-500 font-mono bg-gray-50 border-r border-b border-gray-200">
              {hour}:00
            </div>

            {/* Slots */}
            {days.map((_, dayIndex) => {
              const key = `${dayIndex}-${hour}`;
              const { count = 0, mySlotId, users = [] } = gridData[key] || {};
              const isSelected = !!mySlotId;

              return (
                <div 
                  key={key}
                  // ★ 改為 MouseDown (開始拖曳) 和 MouseEnter (拖曳經過)
                  onMouseDown={(e) => { e.preventDefault(); onMouseDown(dayIndex, hour); }}
                  onMouseEnter={() => onMouseEnter(dayIndex, hour)}
                  
                  className={`
                    h-12 border-r border-b border-gray-200 cursor-pointer relative group
                    transition-all duration-100
                    hover:bg-green-50  /* 滑鼠懸停時給一點極淡的底色回饋 */
                  `}
                  style={getCellStyle(count, isSelected)}
                  title={users.length > 0 ? `${users.length} 人: ${users.join(', ')}` : ''}
                >
                    {/* ★ 移除原本的勾勾 (✓) 和 Ring 邊框 */}
                    
                    {/* Tooltip: 懸停顯示人名 */}
                    {users.length > 0 && (
                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block w-max max-w-[150px] bg-gray-800 text-white text-xs rounded py-1 px-2 shadow-lg text-center pointer-events-none">
                            {users.length} 人: {users.join(', ')}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                    )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      <p className="text-center text-gray-400 text-sm mt-4">
        提示：按住滑鼠左鍵並拖曳，可以快速選取多個時段
      </p>
    </div>
  );
};

export default WeeklyScheduler;