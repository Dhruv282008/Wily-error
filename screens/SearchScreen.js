import React from 'react';
import { Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import db from '../config'
export default class Searchscreen extends React.Component {
  constructor(props){
    super(props)
    this.state({
      allTransactions: [], 
      lastVisibleTransaction: null, 
      search:''
    })
  }
  fetchMoreTransactions = async (text) => {
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transactions").where("bookId","==",text).limit(10).get()
      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transactions").where("studentId","==",text).limit(10).get(
        transaction.docs.map(doc=>{
          this.setState({
            allTransactions: [...this.setState.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      )
    }
  }
  componentDidMount = async () => {
    const query  = await db.collection("transactions").limit(10).get()
    query.docs.map(doc=>{
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc
      })
    })
  }
  searchTransactions = async (text) => {
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transactions").where("bookId","==",text).get()
      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transactions").where("studentId","==",text).get(
        transaction.docs.map(doc=>{
          this.setState({
            allTransactions: [...this.setState.allTransactions, doc.data()],
            lastVisibleTransaction: doc
          })
        })
      )
    }
  }
  render() {

      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <View styles = {styles.searchBar}>
            <TextInput style = {styles.bar} placeholder = "Enter Book ID Or Student ID"
            onChangeText = {text => this.setState({search: text})}
            />
            <TouchableOpacity style = {styles.searchButton}
              onPress = {()=>{this.searchTransactions(this.state.search)}}
            ><Text>Search</Text></TouchableOpacity>
          </View>
          <FlatList 
          data = {this.state.allTransactions}
          renderItem = {({item})=>{
            <View style = {{borderWidth: 2}}>
              <Text>{"Book ID: "+item.bookId}</Text>
              <Text>{"Student ID: "+item.studentId}</Text>
              <Text>{"Transaction Type: "+item.transactiontype}</Text>
              <Text>{"Date: "+item.date.toDate()}</Text>
            </View>
          }}
          keyExtractor = {(item, index)=>index.toString()}
          onEndReached = {this.fetchMoreTransactions}
          onEndReachedThreshold = {0.7}
          ></FlatList>
        </View>
      );
    }
  }
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
  searchBar:{
    flexDirection:'row',
    height:40,
    width:'auto',
    borderWidth:0.5,
    alignItems:'center',
    backgroundColor:'grey',

  },
  bar:{
    borderWidth:2,
    height:30,
    width:300,
    paddingLeft:10,
  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'
  }
})