<?php
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Et ole kirjautunut sisään"]);
    exit;
}

// db.php dosyanı dahil et (PDO kullandığını varsayıyorum)
include '../Tauluvalikko/db.php'; 

$data = json_decode(file_get_contents("php://input"), true);
$title = trim($data['title'] ?? '');
$visibility = $data['visibility'] ?? 'private';
$owner_id = $_SESSION['user_id'];

if (!$title) {
    echo json_encode(["error" => "Anna taululle nimi"]);
    exit;
}

try {
    // Sadece owner_id ve user_id'yi session'dan alarak ekliyoruz
    $stmt = $pdo->prepare("INSERT INTO boards (owner_id, user_id, title, visibility, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$owner_id, $owner_id, $title, $visibility]);
    
    $board_id = $pdo->lastInsertId();
    $code = null;

    // Paylaşım kodu oluşturma (shared veya public ise)
    if ($visibility === 'shared' || $visibility === 'public') {
        $code = strtoupper(substr(md5(uniqid()), 0, 6));
        $stmt2 = $pdo->prepare("INSERT INTO board_share_codes (board_id, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
        $stmt2->execute([$board_id, $code]);
        
        // Opsiyonel: Kodu ana tabloya da güncelle
        $pdo->prepare("UPDATE boards SET code = ? WHERE id = ?")->execute([$code, $board_id]);
    }

    echo json_encode([
        "success" => true,
        "board_id" => $board_id,
        "code" => $code
    ]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Veritabanı hatası: " . $e->getMessage()]);
}