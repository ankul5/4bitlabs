// Utility helper functions

export const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const getGradientColors = (type = 'primary') => {
  const gradients = {
    primary: ['#ba0013', '#e31e24'],
    secondary: ['#3755c3', '#708cfd'],
    tertiary: ['#006190', '#007bb5'],
  };
  return gradients[type] || gradients.primary;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};
