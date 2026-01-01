<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "taskmanager");

if ($conn->connect_error) {
    echo json_encode(["success" => false]);
    exit;
}

// Käytetään session ID:tä tai oletuksena ID 1 testausta varten
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; 

$sql = "SELECT theme_index, profile_pic FROM users WHERE id = $user_id";
$result = $conn->query($sql);

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "theme_index" => (int)$row['theme_index'],
        "profile_pic" => $row['profile_pic']
    ]);
} else {
    echo json_encode(["success" => false]);
}
?>