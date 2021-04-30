import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import *as firebase from 'firebase'
import db from '../config.js'
export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ""
      }
      
    }
    checkBookEligibility = async () => {
      const bookref = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
      var transactiontype = ""
      if (bookref.docs.length == 0){
        transactiontype = false
      }
      else{
        bookref.docs.map(doc => {
          var book = doc.data()
          if (book.bookAvailability){
            transactiontype = "issue"
          }
          else{
            transactiontype = "return"
          }
        })
      }
      return transactiontype
    }
    checkStudentEligibilityforbookIssue = async () => {
      const studentref = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
      var studentIsEligible = ""
      if(studentref.docs.length == 0){
        studentIsEligible = false
        Alert.alert("The Student does not EXIST in the database")
        this.setState({
          scannedBookId: "",
          scannedStudentId: ""
        }) 
        
      }
      else{
        studentref.docs.map(doc => {
          var student = doc.data()
          if(student.numberofbooksissued < 2){
            studentIsEligible = true
          }
          else{
            studentIsEligible = false
            Alert.alert("The student has already issued 2 books!")
            this.setState({
              scannedBookId: "",
              scannedStudentId: ""
            })
          }
          
        })
      }
      return studentIsEligible
    }
    checkStudentElgilibiltyforBookReturn = async () =>{
      const transactionref = await db.collection("transaction").where("bookId", "==", this.state.scannedBookId).limit(1).get()
      var studentIsEligible = ""
      transactionref.docs.map(doc => {
        var lastbookTransaction = doc.data()
        if(lastbookTransaction.studentId == this.state.scannedStudentId){
          studentIsEligible = true
        }
        else{
          studentIsEligible = false
          Alert.alert("The Book Wasn't issued by the student!")
          this.setState({
            scannedBookId: "",
            scannedStudentId: ""
          })
        }
      })
      return studentIsEligible
    }
    handleTransaction = async () => {
      //verify if the student is eligible for book issue or return or none
      //student id exists in the database
      //issue : number of book issued < 2
      //issue: verify book availability
      //return: last transaction -> book issued by the student id
      var transactionType = await this.checkBookEligibility();
  
      if (!transactionType) {
        Alert.alert("The book doesn't exist in the library database!");
        this.setState({
          scannedStudentId: "",
          scannedBookId: ""
        });
      } else if (transactionType === "Issue") {
        var isStudentEligible = await this.checkStudentEligibilityforbookIssue();
        if (isStudentEligible) {
          this.initiateBookIssue();
          Alert.alert("Book issued to the student!");
        }
      } else {
        var isStudentEligible = await this.checkStudentElgilibiltyforBookReturn();
        if (isStudentEligible) {
          this.initiateBookReturn();
          Alert.alert("Book returned to the library!");
        }
      }
    };
   initiateBookIssue = async() => {
     //add a transaction
     db.collection("transaction").add({
       'studentId': this.state.scannedStudentId,
       'bookId': this.state.scannedBookId,
       'date': firebase.firestore.Timestamp.now().toDate(),
       'transactiontype': "issue",
     })
     db.collection("books").doc(this.state.scannedBookId).update({
       'bookAvailability': false
     })
     db.collection("students").doc(this.state.scannedStudentId).update({
      'numberofbooksissued':firebase.firestore.FieldValue.increment(1)

     })
   } 

   initiateBookReturn = async() => {
    //add a transaction
    db.collection("transaction").add({
      'studentId': this.state.scannedStudentId,
      'bookId': this.state.scannedBookId,
      'date': firebase.firestore.Timestamp.now().toDate(),
      'transactiontype': "return",
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      'bookAvailability': true
    })
    db.collection("students").doc(this.state.scannedStudentId).update({
     'numberofbooksissued':firebase.firestore.FieldValue.increment(-1)

    })
  } 
    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView
            behavior = 'padding'
            style  = {styles.container}
            enabled
          >
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = {text => this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = {text => this.setState({scannedStudentId: text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity onPress = {async() => {var transactionMessage = this.handleTransaction()}}style = {styles.submitButton}><Text style = {styles.submitButtonText}>SUBMIT</Text></TouchableOpacity>
            </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 },
    submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, fontWeight:"bold", color: 'white' }
  });