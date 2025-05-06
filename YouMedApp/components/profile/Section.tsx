import { View } from 'react-native';

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

const Section = ({ children, className = '' }: SectionProps) => {
  return (
    <View className={`mb-4 rounded-xl bg-white px-4 shadow ${className}`}>{children}</View>
  );
};

export default Section;
