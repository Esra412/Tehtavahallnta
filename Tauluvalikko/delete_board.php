<?php
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Et ole kirjautunut"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$boardId = $data["id"] ?? null;
$userId = $_SESSION['user_id'];

if (!$boardId) {
    echo json_encode(["error" => "Virheellinen ID"]);
    exit;
}

require "db.php";

/* 1️⃣ Poista ensin jakokoodit */
$stmt = $pdo->prepare("
    DELETE FROM board_share_codes 
    WHERE board_id = ?
");
$stmt->execute([$boardId]);

/* 2️⃣ Poista itse taulu VAIN jos käyttäjä omistaa sen */
$stmt = $pdo->prepare("
    DELETE FROM boards 
    WHERE id = ? AND owner_id = ?
");
$stmt->execute([$boardId, $userId]);

if ($stmt->rowCount() === 0) {
    echo json_encode(["error" => "Taulua ei löytynyt tai ei oikeuksia"]);
    exit;
}

echo json_encode(["success" => true]);
