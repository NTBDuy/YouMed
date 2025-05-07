import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from 'components/HeaderSection';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { Clinic } from 'types/Clinic';
import { fetchClinics } from 'utils/apiUtils';
import { ActivityIndicator, View, Text } from 'react-native';

const NearbyClinic = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortedClinics, setSortedClinics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCoordinatesFromAddress = async (address: string) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) return null;
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  };

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
        const clinicsWithLocation = await Promise.all(
          data.map(async (clinic: Clinic) => {
            const coords = await getCoordinatesFromAddress(clinic.clinicAddress);
            if (!coords) return null;
            const distance = userLocation
              ? getDistance(userLocation, coords)
              : Number.MAX_SAFE_INTEGER;
            return { ...clinic, location: coords, distance };
          })
        );
        const validClinics = clinicsWithLocation.filter((c) => c !== null);
        validClinics.sort((a, b) => a.distance - b.distance);
        setSortedClinics(validClinics);
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

      {(!userLocation || isLoading) ? (
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
          <Marker coordinate={userLocation} title="You are here" />
          {sortedClinics.map((clinic) => (
            <Marker
              key={clinic.clinicID}
              coordinate={clinic.location}
              title={clinic.name}
              description={clinic.clinicAddress}
            />
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
};

export default NearbyClinic;