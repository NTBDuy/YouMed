import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import HeaderSection from 'components/HeaderSection'

const DoctorScheduleScreen = () => {
  return (
    <SafeAreaView>
        <HeaderSection title='Doctor Schedule' backBtn />
    </SafeAreaView>
  )
}

export default DoctorScheduleScreen