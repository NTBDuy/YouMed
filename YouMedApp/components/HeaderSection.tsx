import { Pressable, Text, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import { getBackgroundColor } from 'utils/colorUtils';

interface HeaderSectionProps {
  title?: string;
  backBtn?: boolean;
  rightElement?: React.ReactNode;
  customTitle?: React.ReactNode;
  serchSection?: boolean;
  searchQuery?: string;
  handleSearch?: any;
  placeholder?: string;
  clearSearch?: any;
}
const HeaderSection = ({
  title,
  backBtn = false,
  rightElement,
  customTitle,
  serchSection,
  searchQuery,
  handleSearch,
  placeholder,
  clearSearch,
}: HeaderSectionProps) => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    <View className={`-mt-20 rounded-b-3xl bg-${getBackgroundColor(user!.role)}-600 px-4 pb-4 pt-20 shadow-md`}>
      <View className="mt-2 flex-row items-center justify-center">
        {backBtn && (
          <Pressable
            className="absolute left-0 flex-row py-4 pr-10"
            onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} size={16} color="#FFFFFF" />
          </Pressable>
        )}

        {customTitle ? customTitle : <Text className="text-xl font-bold text-white">{title}</Text>}

        {rightElement && (
          <View className="absolute right-0 flex-row py-4 pl-10">{rightElement}</View>
        )}
      </View>

      {serchSection && (
        <View className="mt-4 flex-row items-center rounded-full bg-white/10 px-4 py-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#FFFFFF" />
          <TextInput
            className="ml-3 flex-1 text-white"
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <Pressable onPress={clearSearch}>
              <FontAwesomeIcon icon={faXmark} size={16} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default HeaderSection;
