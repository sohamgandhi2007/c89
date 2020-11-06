import React from 'react';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { AppStackNavigator } from './AppStackNavigator'
import RequestScreen from '../screens/RequestScreen';

export const AppTabNavigator = createBottomTabNavigator({
  DonateBooks : {
    screen: AppStackNavigator,
    navigationOptions :{
      tabBarLabel : "Donate Things",
    }
  },
  ThingRequest: {
    screen: RequestScreen,
    navigationOptions :{
      tabBarLabel : "Thing Request",
    }
  }
});
