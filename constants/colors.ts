// 应用颜色常量 - 黑暗风格

export const AppColors = {
  // 主色调
  primary: '#00D9FF',        // 青蓝色
  primaryDark: '#00A8CC',
  primaryLight: '#1A2332',
  
  // 状态颜色
  success: '#00E676',        // 亮绿色
  warning: '#FFD54F',        // 柔和黄色
  danger: '#FF5252',         // 亮红色
  info: '#00D9FF',
  
  // 游戏状态
  playing: '#00E676',
  waiting: '#FFD54F',
  finished: '#757575',
  
  // 特殊颜色
  gold: '#FFD700',
  profit: '#00E676',
  loss: '#FF5252',
  
  // 中性色 - 黑暗主题
  white: '#FFFFFF',
  black: '#0A0E14',          // 深黑背景
  dark: '#E0E0E0',           // 浅色文字
  gray: '#B0B0B0',           // 中灰文字
  lightGray: '#808080',      // 深灰文字
  borderGray: '#2D3748',     // 深色边框
  background: '#151922',     // 深灰背景
  cardBackground: '#1E2530', // 卡片背景
  surfaceBackground: '#0F1419', // 表面背景
  
  // 转账指引
  transferBackground: '#2D2416',
  transferIcon: '#FF6B35',
} as const;
