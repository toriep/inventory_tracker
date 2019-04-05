<?php 
  // Headers
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  header('Access-Control-Allow-Methods: DELETE');
  header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');
  
  include_once('../config/Database.php');
  include_once('../model/Items.php');

  $id = $_POST['item_id'];

  // Instantiate DB & connect
  $database = new Database();
  $db = $database->connect();
  // Instantiate blog item object
  $item = new Items($db);

  // Set ID to update
  $item->id = $id;
  // Delete item
  if($item->delete()) {
    echo json_encode(
      array('message' => 'Item Deleted')
    );
  } else {
    echo json_encode(
      array('message' => 'Item Not Deleted')
    );
  }