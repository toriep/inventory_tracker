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
 * itemsArray - global array to hold item objects
 * @type {Array}
 */
let itemsArray = [];
let isChecked;


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
  $('#itemName').focusin(function(){
    $('#itemName').removeClass('error');
    $('.glyphicon-tag').removeClass('glyphError');
  });
  $('#price').focusin(function(){
    $('#price').removeClass('error');
    $('.glyphicon-usd').removeClass('glyphError');
  });
  $('#itemQuantity').focusin(function(){
    $('#itemQuantity').removeClass('error');
    $('.glyphicon-shopping-cart').removeClass('glyphError');
  });

  $("#itemQuantity").on("keyup", function(event) {
    if (event.keyCode === 13) {//if enter key is released
      $("#addBtn").click();//runs the function attaches to click event off add button
    }
  });
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
  const name = $('#itemName').val();
  const price = $('#price').val();
  const quantity = $('#itemQuantity').val();
  const item = { name, price, quantity};
  if(!areInputsValid(item.name, item.price, item.quantity)){//if any of the forms is invalid, disable adding item
    return;
  };
  itemsArray.push(item);
  clearAddItemFormInputs();
  updateItemList(itemsArray[itemsArray.length-1]);
  sendDataToAPI(item);
};
/***************************************************************************************************
 * clearAddItemForm - clears out the form values based on inputIds variable
 */
function clearAddItemFormInputs(){
  $('#itemName').val("");
  $('#price').val("");
  $('#itemQuantity').val("");
};
/***************************************************************************************************
 * renderItemOnDom - take in a item object, create html elements from the values and then append the elements
 * into the .item_list tbody
 * @param {object} itemObj a single item object with price, name, and quantity inside
 */

function renderItemOnDom(itemObj, index){
  const name = $('<td>',{
    text: itemObj.name,
    class: `itemName ${itemObj.id}`,
  });
  const price = $('<td>',{
    text: itemObj.price,
    class: `price ${itemObj.id}`
  });
  const quantity = $('<td>',{
    text: itemObj.quantity,
    class: `quantity ${itemObj.quantity}`
  });
  const deleteButton = $('<button>',{
    class: "btn btn-danger btn-xs",
    text: 'Delete'
  });
  const editButton = $('<button>',{
    class: "btn btn-warning btn-xs",
    text: 'Edit'
  });
  deleteButton.click(function(){
    const currentRow = $(this).parent().parent().parent();//select the current table row
    if(!isChecked){//if "Do not ask this again" is not checked
    showDeleteModal(itemObj, currentRow);
  } else{
    removeItem(itemObj, currentRow);
  };
  });
  editButton.click(function(){
    const currentRow = $(this).parent().parent().parent();//select the current table row
    showEditModal(itemObj, currentRow);
  });
  const buttonsDiv = $('<div>');
  const deleteTD = $('<td>');
  buttonsDiv.append(editButton, deleteButton).appendTo(deleteTD);
  if(index%2 == 0){
    var tableRowIndex = $('<tr>',{
      class: "gray"
    });
  } else{
    var tableRowIndex = $('<tr>');
  }
  tableRowIndex.append(name, price, quantity, deleteTD).appendTo('tbody');
};

/***************************************************************************************************
 * updateItemList - centralized function to update the average and call item list update
 * @param items {array} the array of item objects
 * @returns {undefined} none
 * @calls renderItemOnDom, calculateQuantityAverage, renderQuantityAverage
 */
function updateItemList(item){
  renderItemOnDom(item);
  renderQuantityAverage(calculateQuantityAverage());
};
/***************************************************************************************************
 * calculateQuantityAverage - loop through the global item array and calculate average quantity and return that value
 * @param: {array} items  the array of item objects
 * @returns {number}
 */
function calculateQuantityAverage(){
  var sumOfQuantitys = 0;
  for(var a=0;a<itemsArray.length;a++){
    sumOfQuantitys+=parseInt(itemsArray[a].quantity);
  };
  var average = Math.round(sumOfQuantitys/itemsArray.length);
  return average;
};
/***************************************************************************************************
 * renderQuantityAverage - updates the on-page quantity average
 * @param: {number} average    the quantity average
 * @returns {undefined} none
 */
function renderQuantityAverage(averageQuantity){
  if(itemsArray.length === 0){
    averageQuantity=0;
  };
  $('.avgQuantity').text(averageQuantity);
};

function removeItem(item, row){
  const itemIndex = itemsArray.indexOf(item);
  const itemID = itemsArray[itemIndex].id;
  itemsArray.splice(itemIndex,1);
  row.remove();
  renderQuantityAverage(calculateQuantityAverage());
  deleteFromAPI(itemID);
};

function getItemData(){
  const itemsAPI = {
    url: readUrl,
    success: displayItems,
    method: 'post',
    dataType: 'json',
    error: showError,
  };
  $.ajax(itemsAPI);
};

function displayItems(response){
  const inventory = response.data;
  for(let s=0;s<inventory.length;s++){
    itemsArray.push(inventory[s]);
    renderItemOnDom(inventory[s],s);
  };
};

function sendDataToAPI(item){
  const { name, price, quantity } = item;
  const itemsAPI = {
    url: createUrl,
    success: addDataToAPI,
    method: 'post',
    data: {
      name,
      price,
      quantity
    },
    dataType: 'json',
    error: showError,
    }
  $.ajax(itemsAPI);
};

function addDataToAPI(response){
  const lastitem = itemsArray[itemsArray.length-1];
  lastitem.id = response.last_id;
};

function showError(response){
  console.log('AJAX call failed: ' + response);
};

function deleteFromAPI(ID){
  const itemsAPI = {
    url: deleteUrl,
    method: 'post',
    data: {
      item_id: ID
    },
    dataType: 'JSON',
    error: showError,
  };
  $.ajax(itemsAPI);
};

function sendUpdateToAPI(item){
  const { name, price, quantity, id } = item;
  const updatedItem = {
    url: updateUrl,
    success: () => location.reload(),
    method: 'post',
    data: {
      name,
      price,
      quantity,
      id
    },
    dataType: 'JSON',
    error: showError,
    }
  $.ajax(updatedItem);
};

function showDeleteModal(item,row){
  let modal = document.getElementById('deleteModal')
  let span = document.getElementsByClassName("close")[0];
  let deleteBtn = document.getElementById('delButton');
  let cancelBtn = document.getElementById('cancelButton');
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
  if(document.getElementById("noAsking").checked === true){
    isChecked = true;
  } else{
    isChecked = false;
  };
};

function areInputsValid(name, price, quantity){
  let invalidCounter = 0;
  if (name < 2 || !isNaN(name) ){ 
    invalidCounter++;
    $('#itemName').val("");
    $('#itemName').attr("placeholder", "Enter at least 2 letters").addClass('red error');
    $('.glyphicon-tag').addClass('glyphError');
  };
  if(isNaN(price) || price.length<1){ 
    invalidCounter++
    $('#price').val("");
    $('#price').attr("placeholder", "Enter a valid number").addClass('red error');
    $('.glyphicon-usd').addClass('glyphError');
  };
  if(isNaN(quantity) || quantity.length<1){//if item quantity input is not a number
    invalidCounter++
    $('#itemQuantity').val("");//clear the item quantity form
    $('#itemQuantity').attr("placeholder", "Enter a valid number").addClass('red error');
    $('.glyphicon-shopping-cart').addClass('glyphError');
  };
  if(invalidCounter === 0){
    return true;
  };
};

function removeRedFromItemForm(){
  $('#itemName').removeClass('red error').attr("placeholder", "item Name");
  $('#itemName').closest().removeClass('red error');
  $('.glyphicon-tag').removeClass('glyphError');
};

function removeRedFromPriceForm(){
  $('#price').removeClass('red error').attr("placeholder", "item price");
  $('#price').closest().removeClass('red error');
  $('.glyphicon-usd').removeClass('glyphError');
};

function removeRedFromQuantityForm(){
  $('#itemQuantity').removeClass('red error').attr("placeholder", "item quantity");
  $('#itemQuantity').closest().removeClass('red error');
  $('.glyphicon-shopping-cart').removeClass('glyphError');
};

function showEditModal(item, row){
  let modal = document.getElementById('editModal')
  let span = document.getElementById("closeEdit");
  let editBtn = document.getElementById('editButton');
  let cancelEditBtn = document.getElementById('editCancelButton');
  modal.style.display = "block";//display modal

  //Dislayed current value in input fields
  $('#name_edit').val(item.name);
  $('#price_edit').val(item.price);
  $('#quantity_edit').val(item.quantity);

  //exit modal when click on x
  span.onclick = function() {
    modal.style.display = "none";
  };
  window.onclick = function(event) {//exit modal when click anywhere outside of modal
    if (event.target == modal) {
      modal.style.displleletay = "none";
    };
  };
  editBtn.onclick = function() {//when edit button on modal is clicked
    editDisplayeditem(item,row)
    modal.style.display = "none";
  };
  cancelEditBtn.onclick = function() {
    modal.style.display = "none";
  };
};

function editDisplayeditem(oldItem,row){
  const id = parseInt(oldItem.id);
  const name = $('#name_edit').val();
  const quantity = $('#quantity_edit').val();
  const price = $('#price_edit').val();
  const item = { id, name, quantity, price };
  if(!areInputsValid(item.name, item.price, item.quantity)){//if any of the forms is invalid, disable adding item
    return;
  };
  // row.remove();
  // var itemIndex = itemsArray.indexOf(oldItem);
  // itemsArray[itemIndex].name = item.name;
  // itemsArray[itemIndex].price = item.price;
  // itemsArray[itemIndex].quantity = item.quantity;
  // updateItemList(itemsArray[itemIndex]);
  sendUpdateToAPI(item);
};

