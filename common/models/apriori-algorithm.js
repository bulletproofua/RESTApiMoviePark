'use strict';
var data = require( "../../server/boot/data.json" );
var _ = require( 'underscore' );
var Mingo = require('mingo');
var Backbone = require('backbone');

module.exports = function( Apriorialgorithm ) {

function getOnlyIds(data){
    var result = [];

    for(var user in data){
        var arr = [];
        data[user].forEach(function(movie) {
            arr.push(Number(movie['id']));
        });
        result.push(arr);
    }
    return result;
};

function includes(itemsOfUser, itemSet) {

    for(var i = 0; i < itemSet.length; i++){
        if (itemsOfUser.indexOf(itemSet[i]) == -1) return false;
    };
    return true;
}

function countSupport(data, itemSets){
    var itemSetsLocal = [];

    for (var j = 0; j < itemSets.length; j++) {
        itemSetsLocal.push( { id: itemSets[j] , support: 0});
        for (var i = 0; i < data.length; i++) {
            if (includes(data[i], itemSetsLocal[j]['id'])){
                itemSetsLocal[j]['support']++;
            }
        }
    }
    return itemSetsLocal;
}

function check(arr){
  var res = false

  for (var i = 0; i < arr.length; i++) {
    for (var j=i+1 ; j < arr.length; j++) {
        if(arr[i].id == arr[j].id){
          res = true;
        }
    }
  }
  return res;
}

function contains(array, element){

  for (var i = 0; i < array.length; i++) {
       if( _.isEqual(array[i], element)) return true;
  }
  return false;
}

function createPairs(itemSets){
  var arrOfCouple = [];

  for (var i = 0; i < itemSets.length; i++) {
    for (var j = i+1; j < itemSets.length; j++) {
      var itemElement = createItemSet(itemSets[i].id, itemSets[j].id);
      if( itemElement != null){
        if( !contains(arrOfCouple, itemElement)){
          arrOfCouple.push( itemElement );
        }
      }
    }
  }
  return arrOfCouple;
}

function createItemSet(itemSet1, itemSet2){
  var uniqueElements = [];
  if(itemSet1.length != itemSet2.length ) return null;

    itemSet1.forEach(function(item){
      if(uniqueElements.indexOf(item) == -1){
        uniqueElements.push(item);
      }
    })
    itemSet2.forEach(function(item){
      if(uniqueElements.indexOf(item) == -1){
        uniqueElements.push(item);
      }
    })

    if( uniqueElements.length == itemSet1.length+1){
      return uniqueElements.sort(
            //   function(a, b) {
            //   return a - b;
            // }
          );
    } else {
      return null;
    }
};

function supCountFilter(arr, minCount){
  var dataArr = [];
  var maxLength = arr.length;
  for (var i = 0; i < maxLength; i++) {
    if(arr[i].support >= minCount) {
      dataArr.push(arr[i]);
    }
  }
  return dataArr;
}

function minSupportArr (arr, minCount){
  var dataArr = [];
  var maxLength = arr.length;
  for (var i = 0; i < maxLength; i++) {
    if(arr[i].support < minCount) {
      dataArr.push(arr[i].id);
    }
  }
  return dataArr;
}

function deleteMinSupElements (arrWithPairs, arrWithMinSup) {
    var itemSet = [];

    for (var i = 0; i < arrWithPairs.length; i++) {
      var minScore = 9999999;
      arrWithPairs[i].length
      for (var j = 0; j < arrWithMinSup.length; j++) {
        var Arr = _.uniq(arrWithPairs[i].concat(arrWithMinSup[j]));
        var minScore = min( minScore, Arr.length );
        if( minScore != arrWithPairs[i].length && j == arrWithMinSup.length-1){
          itemSet.push(arrWithPairs[i]);
        }
      }
    }

    return itemSet;
};

function min(a, b) {
  return a < b ? a : b;
}

//===================================================================================
// var itemSet = [ ['A'], ['B'], ['C'], ['D'], ['E'] ];
// var finalData = [
//   ['A','C','D'],
//   ['B', 'C', 'E'],
//   ['A', 'B', 'C', 'E'],
//   ['B', 'E']
// ];

  // початковий набір даних ( з бд )
  var myData = data;

function Apriori(dataBaseTDB, support){
    var supData, filteredData, minSupArr, dataWhithPairs;
    var finalData;
    var itemSet =[];
    var lastResult = [];


    for(var key in myData){
        for (var i = 0 ; i < myData[key].length; i++) {
          var elementOfMyData = [ Number(myData[key][i].id )];
          if(!contains(itemSet , elementOfMyData )){
            itemSet.push( elementOfMyData );
          }
        }
    }

    itemSet.sort(function(a,b){
      return a - b ;
    });

  finalData = getOnlyIds(myData);

  while (itemSet.length != 1) {
    supData = countSupport(finalData, itemSet)
    filteredData = supCountFilter(supData, support)
    minSupArr = minSupportArr(supData, support)
    dataWhithPairs = createPairs(filteredData);
    lastResult = itemSet;

    itemSet = deleteMinSupElements(dataWhithPairs , minSupArr);
    if(itemSet.length == 0){
      return _.union(_.flatten(lastResult));
    }
  }
  return _.union(_.flatten(lastResult));
}

var aprioriResult = Apriori(myData, 3);
console.log('APRIORIRESULT', aprioriResult)

  Apriorialgorithm.remoteMethod( 'Apriorialgorithm', {
    description: "Return data",
    // isStatic: false,
    // accepts:{
    //    arg: "id",
    //    type:"number",
    //    required:true
    // },
    http: {
      path: '/:id/Apriorialgorithm',
      verb: 'get'
    },
    returns: {
      arg: 'aprioriResult',
      type: 'array'
    }
  } );
};
