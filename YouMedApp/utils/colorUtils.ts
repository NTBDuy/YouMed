export const getIconColor = (role?: string) => {
    switch (role) {
      case 'Client':
        return '#2563eb';
      case 'Doctor':
        return '#059669';
      case 'Clinic':
        return '#0891b2';
      default:
        return '#0F766E';
    }
  };
  
  export const getBackgroundColor = (role?: string) => {
    switch (role) {
      case 'Client':
        return 'blue';
      case 'Doctor':
        return 'emerald';
      case 'Clinic':
        return 'cyan';
      default:
        return 'teal';
    }
  };