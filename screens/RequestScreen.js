import React, { Component } from "react";
import {  View,Text,StyleSheet,TouchableOpacity,FlatList,TouchableHighlight,Alert,Image} from "react-native";
import db from "../config";
import firebase from "firebase";
import { RFValue } from "react-native-responsive-fontsize";
import {Input } from "react-native-elements";
import MyHeader from "../components/MyHeader";
import { ThingSearch } from "react-native-google-books";

export default class RequestScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      thingName: "",
      reasonToRequest: "",
      IsThingRequestActive: "",
      requestedThingName: "",
      bookStatus: "",
      requestId: "",
      userDocId: "",
      docId: "",
      Imagelink: "#",
      dataSource: "",
      requestedImageLink: "",
      showFlatlist: false,
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  addRequest = async (thingName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
    var books = await ThingSearch.searchthing(
      thingName,
      "AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
    );


    db.collection("requested_things").add({
      user_id: userId,
      thing_name: thingName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      thing_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
      image_link: books.data[0].volumeInfo.imageLinks.thumbnail,
    });

    await this.getThingRequest();
    db.collection("users")
      .where("email_id", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsThingRequestActive: true,
          });
        });
      });

    this.setState({
      thingName: "",
      reasonToRequest: "",
      requestId: randomRequestId,
    });

    return Alert.alert("Thing Requested Successfully");
  };

  receivedThings = (thingName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("received_things").add({
      user_id: userId,
      thing_name: thingName,
      request_id: requestId,
      thingStatus: "received",
    });
  };

  getIsThingRequestActive() {
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IsThingRequestActive: doc.data().IsThingRequestActive,
            userDocId: doc.id,
          });
        });
      });
  }

  getThingRequest = () => {
    var thingRequest = db
      .collection("requested_things")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().book_status !== "received") {
            this.setState({
              requestId: doc.data().request_id,
              requestedThingkName: doc.data().book_name,
              thingStatus: doc.data().thing_status,
              requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;
          db.collection("all_notifications")
            .where("request_id", "==", this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var thingName = doc.data().book_name;
                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name + " " + lastName + " received the thing " + thingName,
                  notification_status: "unread",
                  thing_name: thingName,
                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getThingRequest();
    this.getIsThingRequestActive();
  }

  updateThingRequestStatus = () => {
    db.collection("requested_things").doc(this.state.docId).update({
      thing_status: "received",
    });
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsThingRequestActive: false,
          });
        });
      });
  };
  async getThingsFromApi(thingName) {
    this.setState({ thingName: thingName });
    if (thingName.length > 2) {
      var things = await ThingSearch.searchthing(
        thingName,
        "AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
      );
      this.setState({
        dataSource: things.data,
        showFlatlist: true,
      });
    }
  }
  renderItem = ({ item, i }) => {
    let obj = {
      title: item.volumeInfo.title,
      selfLink: item.selfLink,
      buyLink: item.saleInfo.buyLink,
      imageLink: item.volumeInfo.imageLinks,
    };

    return (
      <TouchableHighlight
        style={styles.touchableopacity}
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => {
          this.setState({
            showFlatlist: false,
            bookName: item.volumeInfo.title,
          });
        }}
        bottomDivider
      >
        <Text> {item.volumeInfo.title} </Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.IsThingRequestActive === true) {
      return (
        <View style={{ flex: 1}}>
          <View
            style={{
              flex: 0.1,
            }}
          >
            <MyHeader title="Thing Status" navigation={this.props.navigation} />
          </View>
          <View
            style={styles.ImageView}
          >
            <Image
              source={{ uri: this.state.requestedImageLink }}
              style={styles.imageStyle}
            />
          </View>
          <View
            style={styles.thingstatus}
          >
            <Text
              style={{
                fontSize: RFValue(20),

              }}
            >
              Name of the thing
            </Text>
            <Text
              style={styles.requestedthingName}
            >
              {this.state.requestedThingName}
            </Text>
            <Text
              style={styles.status}
            >
              Status
            </Text>
            <Text
              style={styles.bookStatus}
            >
              {this.state.bookStatus}
            </Text>
          </View>
          <View
            style={styles.buttonView}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updateThingRequestStatus();
                this.receivedThings(this.state.requestedThingName);
              }}
            >
              <Text
                style={styles.buttontxt}
              >
                Thing Recived
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <MyHeader title="Request Thing" navigation={this.props.navigation} />
        </View>
        <View style={{ flex: 0.9 }}>
          <Input
            style={styles.formTextInput}
            label={"Thing Name"}
            placeholder={"Thing name"}
            containerStyle={{ marginTop: RFValue(60) }}
            onChangeText={(text) => this.getThingsFromApi(text)}
            onClear={(text) => this.getThingsFromApi("")}
            value={this.state.thingName}
          />
          {this.state.showFlatlist ? (
            <FlatList
              data={this.state.dataSource}
              renderItem={this.renderItem}
              enableEmptySections={true}
              style={{ marginTop: RFValue(10) }}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Input
                style={styles.formTextInput}
                containerStyle={{ marginTop: RFValue(30) }}
                multiline
                numberOfLines={8}
                label={"Reason"}
                placeholder={"Why do you need the thing"}
                onChangeText={(text) => {
                  this.setState({
                    reasonToRequest: text,
                  });
                }}
                value={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={[styles.button, { marginTop: RFValue(30) }]}
                onPress={() => {
                  this.addRequest(
                    this.state.thingName,
                    this.state.reasonToRequest
                  );
                }}
              >
                <Text
                  style={styles.requestbuttontxt}
                >
                  Request
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formTextInput: {
    width: "75%",
    height: RFValue(35),
    borderWidth: 1,
    padding: 10,
  },
  ImageView:{
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginTop:20
  },
  imageStyle:{
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: "center",
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  bookstatus:{
    flex: 0.4,
    alignItems: "center",

  },
  requestedbookName:{
    fontSize: RFValue(30),
    fontWeight: "500",
    padding: RFValue(10),
    fontWeight: "bold",
    alignItems:'center',
    marginLeft:RFValue(60)
  },
  status:{
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  bookStatus:{
    fontSize: RFValue(30),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  buttonView:{
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontxt:{
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#fff",
  },
  touchableopacity:{
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: "90%",
  },
  requestbuttontxt:{
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "75%",
    height: RFValue(60),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "#32867d",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});