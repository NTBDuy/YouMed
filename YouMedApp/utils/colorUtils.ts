export const getIconColor = (role?: number) => {
    switch (role) {
      case 0:
        return '#2563eb';
      case 1:
        return '#059669';
      case 2:
        return '#0891b2';
      default:
        return '#0F766E';
    }
  };
  
  export const getBackgroundColor = (role?: number) => {
    switch (role) {
      case 0:
        return 'blue';
      case 1:
        return 'emerald';
      case 2:
        return 'cyan';
      default:
        return 'teal';
    }
  };