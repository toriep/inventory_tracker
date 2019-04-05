<?php 
  // Headers
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  header('Access-Control-Allow-Methods: POST');
  header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');
  
  include_once('../config/Database.php');
  include_once('../model/Items.php');

  //Store user input data
  $itemName = $_POST['name'];
  $price = $_POST['price'];
  $quantity = $_POST['quantity'];

  // Instantiate DB & connect
  $database = new Database();
  $db = $database->connect();
  // Instantiate blog item object
  $item = new Items($db);

  $item->name = $itemName;
  $item->price = $price;
  $item->quantity = $quantity;
  // Create item
  if($item->create()) {
    // echo json_encode(
    //   array('message' => 'Item Created')
    // );
    return true;
  } else {
    echo json_encode(
      array('message' => 'Item Not Created')
    );
  }
