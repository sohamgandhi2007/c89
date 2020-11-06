import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import BookDonateScreen from '../screens/DonateScreen';
import BookRequestScreen from '../screens/RequestScreen';



export const AppTabNavigator = createBottomTabNavigator({
  DonateBooks : {
    screen: BookDonateScreen,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/bag.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Donate",
    }
  },
  BookRequest: {
    screen: BookRequestScreen,
    navigationOptions :{
       tabBarLabel : "Request",
    }
  }
});