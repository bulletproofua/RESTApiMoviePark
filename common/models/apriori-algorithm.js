'use strict';
var data = require( "../../server/boot/data.json" );
var _ = require( 'underscore' );
var Mingo = require('mingo');
var Backbone = require('backbone');

module.exports = function( Apriorialgorithm ) {

// function MingoAggreg( dataForAggr, minRating ) {
//   var aggr = [
//     {
//       $match: {
//        rating: {
//          $gt: minRating
//        }
//      }
//    },
//   //  {
//   //      $group: {
//   //        _id: "$id",
//   //        count: { $sum: 1 }
//   //      }
//   //   }
//   ];
//
//   // if (!dataForAggr || !dataForAggr.toJSON) return [];
//   var data = dataForAggr.toJSON();
//   // console.log("in method", data.length);
//   try {
//     var MingoResult = Mingo.aggregate( data , aggr);
//   } catch (e) {
//     return e ;//cb(e);
//   }
//   console.log("================= MINGO =============");
//   return MingoResult;
// }


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


var arrOfItems = [];
var arrOfCountItems = [];

// var filmId = [146, 149, 151, 163, 164, 168, 146, 164,999];  // movies of all users
//
// var itemSet =  [146, 149, 151, 163, 164, 151];
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
          console.log("==========================================")
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
        if( !contains(arrOfCouple, itemElement)){ // перевірити
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
      return uniqueElements.sort(function(a, b) {
        return a - b;
      });
    } else {
      return null;
    }
};


  var myData = data;
  var users = _.keys(myData);


// набір усі ід фільмів найбільш схожих користувачів
  var firstItemSetData = [];

    var firstData =[];
    for(var key in myData){
        for (var i = 0 ; i < myData[key].length; i++) {
          var elementOfMyData = [ Number(myData[key][i].id )];
          if(!contains(firstData , elementOfMyData )){
            firstData.push( elementOfMyData );
          }
        }
    }



var itemSet = firstData;

itemSet.sort(function(a,b){
  return a -b ;
});


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


var finalData = getOnlyIds(myData);
// console.log('FINALDATA', finalData)

countSupport(finalData, itemSet)
var supData = countSupport(finalData, itemSet)
var filteredData = supCountFilter(supData, 2)
var dataWhithPairs = createPairs(filteredData);
console.log('AFTERPAIRS', dataWhithPairs)

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
      arg: 'myData',
      type: 'array'
    }
  } );
};
