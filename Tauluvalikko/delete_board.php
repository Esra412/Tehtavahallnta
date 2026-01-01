<?php
$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;

if (!$id) {
  echo json_encode(["error" => "Virheellinen ID"]);
  exit;
}

//Varmista että käyttäjä omistaa taulun

require "db.php";
$stmt = $pdo->prepare("DELETE FROM boards WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["success" => true]);
