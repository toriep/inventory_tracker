<?php
  //Headers
  header('Access-Control-Allow-Origin: *');//can be accessed by anybody
  header('Content-Type: application/json');

  include_once('../config/Database.php');
  include_once('../model/Items.php');

  //Instantiate DB and connect
  $database = new Database();
  $db = $database->connect();

  //Instantiate item object
  $item = new Items($db);

  //Item query
  $result = $item->read();
  //Get row count
  $num = $result->rowCount();

  //Check if there is any item
  if($num>0){
    //Instantiate an item associative array
    $items_arr = array();
    $items_arr['data'] = array();

    while($row=$result->fetch(PDO::FETCH_ASSOC)) {
      extract($row);

      $stock_item = array(
        'id' => $id,
        'name' => $name,
        'quantity' => $quantity,
        'price' => $price
      );
      
      //Push to 'data'
      array_push($items_arr['data'], $stock_item);
    }

    //turn to JSON & return output
    echo json_encode($items_arr);

  } else {
    //No items
    echo json_encode(
      array('message' => 'No Item Found')
    );
  }

?>