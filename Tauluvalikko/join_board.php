<?php
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Ei kirjautunut"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$code = trim($data['code'] ?? '');

if (!$code) {
    echo json_encode(["success" => false, "error" => "Tyhjä koodi"]);
    exit;
}

require "../Tauluvalikko/db.php";
$user_id = $_SESSION['user_id'];

/* 1️⃣ Haetaan taulu BOARDS-taulusta */
$stmt = $pdo->prepare("
    SELECT id, title 
    FROM boards 
    WHERE code = ?
");
$stmt->execute([$code]);
$board = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$board) {
    echo json_encode(["success" => false, "error" => "Väärä koodi"]);
    exit;
}

/* 2️⃣ Lisätään käyttäjä tauluun (jos ei ole jo) */
$stmt = $pdo->prepare("
    INSERT IGNORE INTO board_members (board_id, user_id)
    VALUES (?, ?)
");
$stmt->execute([$board['id'], $user_id]);

echo json_encode([
    "success" => true,
    "board_id" => $board['id'],
    "title" => $board['title']
]);
