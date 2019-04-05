<?php

class Items{
  //DB
  private $conn;

  //Item properties
  public $id;
  public $name;
  public $price;
  public $quantity;

  //Constructor with DB
  public function __construct($db){
    $this->conn = $db;
  }
  
  // Get Items
  public function read() {
    // Create query
    $query = 'SELECT id, name, price, quantity
              FROM Items';
    
    // Prepare statement
    $stmt = $this->conn->prepare($query);
    // Execute query
    $stmt->execute();
    return $stmt;
  }

}

?>