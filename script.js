/* information about jsdocs: 
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
* 
/**
 * Listen for the document to load and initialize the application
 */
$(document).ready(initializeApp);
/**
 * Define all global variables here.  
 */
/***********************
 * item_array - global array to hold item objects
 * @type {Array}
 * example of item_array after input: 
 * item_array = [
 *  { name: 'Jake', price: 'Math', quantity: 85 },
 *  { name: 'Jill', price: 'Comp Sci', quantity: 85 }
 * ];
 */
var item_array = [];
var isChecked;


// var nameForm = $('#itemName');
// var priceForm = $('#price');
// var quantityForm = $('#itemQuantity');
/***************************************************************************************************
* initializeApp 
* @params {undefined} none
* @returns: {undefined} none
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/
function initializeApp(){
  isChecked = document.getElementById("noAsking").checked;
  addClickHandlersToElements();
  getItemData(); 
};

/***************************************************************************************************
* addClickHandlerstoElements
* @params {undefined} 
* @returns  {undefined}
*     
*/
function addClickHandlersToElements(){
  console.log('click handlers run');
  $('#itemName').focusin(function(){
    $('#itemName').removeClass('error');
    $('.glyphicon-user').removeClass('glyphError');
  });
  $('#price').focusin(function(){
    $('#price').removeClass('error');
    $('.glyphicon-list-alt').removeClass('glyphError');
  });
  $('#itemQuantity').focusin(function(){
    $('#itemQuantity').removeClass('error');
    $('.glyphicon-education').removeClass('glyphError');
  });

  $("#itemQuantity").on("keyup", function(event) {
    if (event.keyCode === 13) {//if enter key is released
    $("#addBtn").click();//runs the function attaches to click event off add button
    }
  });
  // document.addEventListener("keyup", function(event) {
  // if (event.keyCode === 13) {
  //   $("#addBtn").click();
  // }
  // });
};

/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return: 
       none
 */
function handleAddClicked(){
  addItem();
};
/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out item form
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: clearAddItemFormInputs
 */
function handleCancelClick(){
  clearAddItemFormInputs();
};
/***************************************************************************************************
 * addItem - creates a item objects based on input fields in the form and adds the object to global item array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddItemFormInputs, updateItemList
 */
function addItem(){
  var item = {};
  item.name = $('#itemName').val();
  item.price = $('#price').val();
  item.quantity = $('#itemQuantity').val();
  if(!areInputsValid(item.name,item.price,item.quantity)){//if any of the forms is invalid, disable adding item
    return;
  };
  item_array.push(item);
  console.log("item Array: ", item_array);
  clearAddItemFormInputs();
  updateItemList(item_array[item_array.length-1]);
  sendDataToAPI(item);
};
/***************************************************************************************************
 * clearAddItemForm - clears out the form values based on inputIds variable
 */
function clearAddItemFormInputs(){
  console.log('item forms cleared');
  $('#itemName').val("");
  $('#price').val("");
  $('#itemQuantity').val("");
};
/***************************************************************************************************
 * renderItemOnDom - take in a item object, create html elements from the values and then append the elements
 * into the .item_list tbody
 * @param {object} itemObj a single item object with price, name, and quantity inside
 */

 //<button type="button" price="btn btn-danger">Danger</button>
function renderItemOnDom(itemObj){
  var name = $('<td>',{
    text: itemObj.name,
    price: "itemName"
  });
  var price = $('<td>').text(itemObj.price);
  var quantity = $('<td>').text(itemObj.quantity);
  var deleteButton = $('<button>',{
    price: "btn btn-danger btn-xs",
    text: 'Delete'
  });
  var editButton = $('<button>',{
    price: "btn btn-warning btn-xs",
    text: 'Edit'
  });
  deleteButton.click(function(){
    var currentRow = $(this).parent().parent().parent();//select the current table row
    if(!isChecked){//if "Do not ask this again" is not checked
      showDeleteModal(itemObj,currentRow);
    } else{
      removeItem(itemObj,currentRow);
    };
  });
  editButton.click(function(){
    showEditModal(itemObj,$('<td>'));
  });
  var buttonsDiv = $('<div>');
  var deleteTD = $('<td>');
  buttonsDiv.append(editButton,deleteButton).appendTo(deleteTD);
  var tableRowIndex = $('<tr>');
  tableRowIndex.append(name,price,quantity,deleteTD).appendTo('tbody');
};

/***************************************************************************************************
 * updateItemList - centralized function to update the average and call item list update
 * @param items {array} the array of item objects
 * @returns {undefined} none
 * @calls renderItemOnDom, calculateQuantityAverage, renderQuantityAverage
 */
function updateItemList(item){
  var currentitem = item;
  renderItemOnDom(currentitem);
  renderQuantityAverage(calculateQuantityAverage());
};
/***************************************************************************************************
 * calculateQuantityAverage - loop through the global item array and calculate average quantity and return that value
 * @param: {array} items  the array of item objects
 * @returns {number}
 */
function calculateQuantityAverage(){
  var sumofQuantitys = 0;
  for(var a=0;a<item_array.length;a++){
    sumofQuantitys+=parseInt(item_array[a].quantity);
  };
  var average = Math.round(sumofQuantitys/item_array.length);
  console.log("Current average: "+ average);
  return average;
};
/***************************************************************************************************
 * renderQuantityAverage - updates the on-page quantity average
 * @param: {number} average    the quantity average
 * @returns {undefined} none
 */
function renderQuantityAverage(averageQuantity){
  if(item_array.length===0){
    averageQuantity=0;
  };
  $('.avgquantity').text(averageQuantity);
};

function removeItem(item,row){
  var itemIndex = item_array.indexOf(item);
  var itemID = item_array[itemIndex].id;
  item_array.splice(itemIndex,1);
  row.remove();
  renderQuantityAverage(calculateQuantityAverage());
  deleteFromAPI(itemID);
};

function getItemData(){
  var itemsAPI = {
    url: 'http://localhost:5700/read.php',
    success: displayItems,
    method: 'post',
    dataType: 'json',
    error: showError,
  };
  $.ajax(itemsAPI);
};

function displayItems(response){
  var inventory = response.data;
  for(var s=0;s<inventory.length;s++){
    item_array.push(inventory[s]);
    updateItemList(inventory[s]);
  };
  console.log("item_array after pulling API data: ", item_array);
};

function sendDataToAPI(item){
  var itemsAPI = {
    url: 'http://s-apis.learningfuze.com/IT/create',
    success: addDataToAPI,
    method: 'post',
    data: {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    },
    dataType: 'JSON',
    error: showError,
    }
  $.ajax(itemsAPI);
};

function addDataToAPI(response){
  var lastitem = item_array[item_array.length-1];
  console.log('success!');
  lastitem.id = response.new_id;
};

function showError(){
  console.log('AJAX call failed');
};

function deleteFromAPI(ID){
  var itemsAPI = {
    url: 'http://s-apis.learningfuze.com/IT/delete',
    success: showSuccess,
    method: 'post',
    data: {
      item_id: ID
    },
    dataType: 'JSON',
    error: showError,
  };
  $.ajax(itemsAPI);
};

function showSuccess(){
  console.log("item deleted!");
};

function showDeleteModal(item,row){
  var modal = document.getElementById('deleteModal')
  var span = document.getElementsBypriceName("close")[0];
  var deleteBtn = document.getElementById('delButton');
  var cancelBtn = document.getElementById('cancelButton');
  modal.style.display = "block";//display modal
  span.onclick = function() {//exit modal when click on x
    modal.style.display = "none";
  };
  window.onclick = function(event) {//exit modal when click anywhere outside of modal
    if (event.target == modal) {
      modal.style.display = "none";
    };
  };
  deleteBtn.onclick = function(){//when delete button on modal is clicked
    removeItem(item,row);
    isBoxChecked();
    modal.style.display = "none";
  };
  cancelBtn.onclick = function(){
    isBoxChecked();
    modal.style.display = "none";
  };
};

function isBoxChecked() {
  if(document.getElementById("noAsking").checked===true){
    isChecked = true;
  } else{
    isChecked = false;
  };
};

function areInputsValid(name,price,quantity){
  var invalidCounter = 0;
  if (name<2 ){ 
    invalidCounter++;
    $('#itemName').val("");
    $('#itemName').attr("placeholder", "Enter at least 2 letters").addClass('red error');
    $('.glyphicon-user').addClass('glyphError');
  };
  if(price<2 ){ 
    invalidCounter++
    $('#price').val("");
    $('#price').attr("placeholder", "Enter at least 2 letters").addClass('red error');
    $('.glyphicon-list-alt').addClass('glyphError');
  };
  if(isNaN(quantity) || quantity.length<1){//if item quantity input is not a number
    invalidCounter++
    $('#itemQuantity').val("");//clear the item quantity form
    $('#itemQuantity').attr("placeholder", "Enter a valid number").addClass('red error');
    $('.glyphicon-education').addClass('glyphError');
  };
  if(invalidCounter===0){
    return true;
  };
};

function removeRedFromItemForm(){
  $('#itemName').removeClass('red error').attr("placeholder", "item Name");
  $('#itemName').closest().removeClass('red error');
  $('.glyphicon-user').removeClass('glyphError');
};

function removeRedFromPriceForm(){
  $('#price').removeClass('red error').attr("placeholder", "item price");
  $('#price').closest().removeClass('red error');
  $('.glyphicon-list-alt').removeClass('glyphError');
};

function removeRedFromQuantityForm(){
  $('#itemQuantity').removeClass('red error').attr("placeholder", "item quantity");
  $('#itemQuantity').closest().removeClass('red error');
  $('.glyphicon-education').removeClass('glyphError');
};

function showEditModal(item,td){
  var modal = document.getElementById('editModal')
  var span = document.getElementById("closeEdit");
  var editBtn = document.getElementById('editButton');
  var cancelEditBtn = document.getElementById('editCancelButton');
  modal.style.display = "block";//display modal
  span.onclick = function() {//exit modal when click on x
    modal.style.display = "none";
  };
  window.onclick = function(event) {//exit modal when click anywhere outside of modal
    if (event.target == modal) {
      modal.style.display = "none";
    };
  };
  editBtn.onclick = function() {//when edit button on modal is clicked
    editDisplayeditem(item,td)
    modal.style.display = "none";
  };
  cancelEditBtn.onclick = function() {
    modal.style.display = "none";
  };
};

function editDisplayeditem(item,td){
  var nameInput = $('#itemName_edit').val();
  var itemIndex = item_array.indexOf(item);
  if(nameInput.length>1){
    item_array[itemIndex].name=$('#itemName_edit').val();
  };
  td.text(item_array[itemIndex].name)
};

