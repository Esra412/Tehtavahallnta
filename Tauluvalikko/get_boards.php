<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

include '../Tauluvalikko/db.php';
$user_id = $_SESSION['user_id'];

// SQL: Hem sahibiysem (owner_id) hem de üyeysem (board_members) getir
$sql = "SELECT DISTINCT b.id, b.title, b.visibility, b.owner_id, sc.code 
        FROM boards b 
        LEFT JOIN board_share_codes sc ON b.id = sc.board_id
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.owner_id = ? OR bm.user_id = ?";

$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id, $user_id]);
$boards = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($boards);

// get_boards.php içinde bu sorguyu kullan
$stmt = $pdo->prepare("
    SELECT DISTINCT b.id, b.title, b.visibility, b.owner_id 
    FROM boards b 
    LEFT JOIN board_members bm ON b.id = bm.board_id 
    WHERE b.owner_id = ? OR bm.user_id = ?
");
$stmt->execute([$user_id, $user_id]); // Hem sahibi olduklarını hem üyesi olduklarını getirir
?>