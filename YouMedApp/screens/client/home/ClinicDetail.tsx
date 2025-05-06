import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderSection from 'components/HeaderSection';
import { Clinic } from 'types/Clinic';

const ClinicDetail = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { clinic } = route.params as { clinic: Clinic };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderSection title='Clinic Information' backBtn />
      <ScrollView className="-mb-10 p-4">
        <Text className="text-2xl font-bold text-blue-800">{clinic.name}</Text>
        <View className="mt-4">
          <View className="flex-row items-start">
            <Text className="mr-2 text-gray-500">Address:</Text>
            <Text className="flex-1 text-gray-700">{clinic.clinicAddress}</Text>
          </View>
          <View className="mt-3 flex-row items-start">
            <Text className="mr-2 text-gray-500">Phone:</Text>
            <Text className="font-medium text-blue-600">{clinic.phoneNumber}</Text>
          </View>
          {clinic.specialties.length > 0 && (
            <View className="mt-3 flex-row flex-wrap items-center">
              <Text className="mr-2 text-gray-500">Specialties:</Text>
              {clinic.specialties.map((specialty, index) => (
                <View
                  key={index}
                  className="mb-1 mr-2 rounded-lg border border-blue-100 bg-blue-100 px-3 py-1">
                  <Text className="text-xs font-medium text-blue-700">{specialty.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View className="mt-6 rounded-md bg-gray-50 p-3">
          <Text className="mb-2 text-base font-medium text-gray-700">Introduction</Text>
          <Text className="leading-7 tracking-wide text-gray-600">{clinic.introduction}</Text>
        </View>

        <Pressable
          className="mt-6 mb-4 items-center rounded-lg bg-blue-600 py-4"
          onPress={() => navigation.navigate('BookingPage', { clinic: clinic })}>
          <Text className="text-base font-bold text-white">Book now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClinicDetail;