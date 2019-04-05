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

  
  // Create An Item
  public function create() {
    // Create query
    $query = 'INSERT INTO Items SET name = :name, price = :price, quantity = :quantity';
    // Prepare statement
    $stmt = $this->conn->prepare($query);
    // Clean data
    $this->name = htmlspecialchars(strip_tags($this->name));
    $this->price = htmlspecialchars(strip_tags($this->price));
    $this->quantity = htmlspecialchars(strip_tags($this->quantity));
    // Bind data
    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':quantity', $this->quantity);
    // Execute query
    if($stmt->execute()) {
      return true;
  }
  // Print error if something goes wrong
  printf("Error: %s.\n", $stmt->error);
  return false;
}
}

?>