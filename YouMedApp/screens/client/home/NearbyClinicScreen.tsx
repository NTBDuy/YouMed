import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import MapView, { Callout, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { Clinic } from 'types/Clinic';
import { fetchClinics } from 'utils/apiUtils';
import { ActivityIndicator, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NearbyClinicScreen = () => {
  const navigation = useNavigation<any>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [sortedClinics, setSortedClinics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  const loadClinics = async () => {
    try {
      setIsLoading(true);
      const response = await fetchClinics();
      if (response.ok) {
        const data = await response.json();
        const clinicsWithDistance = data
          .filter((clinic: Clinic) => clinic.latitude && clinic.longitude)
          .map((clinic: Clinic) => {
            const distance = userLocation
              ? getDistance(userLocation, {
                  latitude: clinic.latitude,
                  longitude: clinic.longitude,
                })
              : Number.MAX_SAFE_INTEGER;
            return { ...clinic, distance };
          });
        clinicsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
        setSortedClinics(clinicsWithDistance);
      } else {
        console.error('Failed to fetch clinics');
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await getUserLocation();
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadClinics();
    }
  }, [userLocation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderSection title="Clinic Around Here" backBtn />

      {!userLocation || isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500">Loading clinics...</Text>
        </View>
      ) : (
        <MapView
          style={{ flex: 1, marginBottom: -40 }}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          <Marker coordinate={userLocation} title="You are here" image={require('../../../assets/location_dot_icon_72.png')} />
          {sortedClinics.map((clinic) => {
            if (!clinic.latitude || !clinic.longitude || !clinic.clinicID) return null;
            return (
              <Marker
                key={clinic.clinicID.toString()}
                coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
                image={require('../../../assets/clinic_icon_72.png')}>
                <Callout
                  onPress={() =>
                    navigation.navigate('ClinicDetails', { clinicId: clinic.clinicID })
                  }>
                  <View style={{ width: 200 }}>
                    <Text style={{ fontWeight: 'bold' }}>{clinic.name}</Text>
                    <Text>{clinic.clinicAddress ?? 'No address'}</Text>
                    <Text style={{ color: 'blue', marginTop: 5 }}>More details</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      )}
    </SafeAreaView>
  );
};

export default NearbyClinicScreen;
