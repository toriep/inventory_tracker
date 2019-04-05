<?php 
  // Headers
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  header('Access-Control-Allow-Methods: POST');
  header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');
  
  include_once('../config/Database.php');
  include_once('../model/Items.php');

  //Store user input data
  $updatedName = $_POST['name'];
  $updatedPrice = $_POST['price'];
  $updatedQuantity = $_POST['quantity'];
  $updatedId = $_POST['id'];

  // Instantiate DB & connect
  $database = new Database();
  $db = $database->connect();
  // Instantiate updated item object
  $item = new Items($db);

  $item->name = $updatedName;
  $item->price = $updatedPrice;
  $item->quantity = $updatedQuantity;
  $item->id = $updatedId;
  // Update item
  if($item->update()) {
    echo json_encode(
      array('message' => 'Item Updated')
    );
  } else {
    echo json_encode(
      array('message' => 'Item Not Updated')
    );
  }

  // $query = "UPDATE `Items` 
  // SET `name` = '{$this->name}', 
  // `price` = '{$this->price}', 
  // `quantity` = '{$this->quantity}' 
  // WHERE `Items`.`id` = '{$this->id}'  
  // ";
