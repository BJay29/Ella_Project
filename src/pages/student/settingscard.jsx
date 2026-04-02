import React from 'react';
import { useTheme } from '../../context/useTheme';
import { useNotification } from '../../context/useNotification';

const SettingsCard = ({ onClose, soundEffects, setSoundEffects }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { notificationsEnabled, toggleNotifications } = useNotification();

  const Toggle = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0
        ${enabled ? 'bg-[#4CAF50]' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  const settings = [
    {
      icon: '🌙',
      label: 'Dark Mode',
      description: 'Switch between light and dark themes',
      value: darkMode,
      toggle: toggleDarkMode,
    },
    {
      icon: '🔔',
      label: 'Notifications',
      description: 'Receive learning reminders',
      value: notificationsEnabled,
      toggle: toggleNotifications,
    },
    {
      icon: '🎵',
      label: 'Sound Effects',
      description: 'Play sounds for achievements',
      value: soundEffects,
      toggle: () => setSoundEffects((v) => !v),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="font-bold text-gray-800 dark:text-white text-base">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl font-bold leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        {/* Settings Items */}
        <div className="px-5 py-3 divide-y divide-gray-50 dark:divide-gray-700">
          {settings.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
              <Toggle enabled={item.value} onToggle={item.toggle} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#4CAF50] text-white font-bold text-sm rounded-xl hover:bg-[#43A047] transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsCard;