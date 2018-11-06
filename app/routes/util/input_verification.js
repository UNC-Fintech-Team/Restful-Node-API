module.exports = {
  check_for_nulls: function(arr){
    console.log(arr);
    for(let i=0; i<arr.length; i++){
      if(arr[i] == null){
        return false;
      }
    }
    return true;
  },

}
