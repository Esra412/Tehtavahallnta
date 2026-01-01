<?php
session_start();
header('Content-Type: application/json');

// Veritabanı bağlantısı
$conn = new mysqli("localhost", "root", "", "taskmanager");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Bağlantı hatası"]);
    exit;
}

// JSON verisini al
$data = json_decode(file_get_contents("php://input"), true);
// Giriş yapan kullanıcının ID'sini session'dan al (yoksa test için 1 kullan)
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; 

if (isset($data['theme_index']) && isset($data['profile_pic'])) {
    $theme = (int)$data['theme_index'];
    $pic = $conn->real_escape_string($data['profile_pic']);

    // Veritabanını güncelle
    $sql = "UPDATE users SET theme_index = $theme, profile_pic = '$pic' WHERE id = $user_id";
    
    if ($conn->query($sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Eksik veri"]);
}
?>