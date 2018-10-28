module.exports = {
  check_for_nulls: function(arr){
    console.log("inside of check_for_null\n");
    console.log("value of arr is as follows\n");
    console.log(arr);
    for(let i=0; i<arr.length; i++){
      if(arr[i] == null){
        return false;
      }
    }
    return true;
  },

}
