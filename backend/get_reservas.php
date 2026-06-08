<?php
// backend/get_reservas.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Bypass-Tunnel-Reminder");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once 'conexion.php';

// Hacemos JOIN para obtener el nombre del espacio y del usuario
$query = "SELECT r.id_reserva as id, e.nombre as roomName, CONCAT(u.nombre, ' ', u.apellido) as requester, r.estado as status, r.fecha_reserva as reservationDate, r.hora_inicio as startTime, r.hora_fin as endTime, r.observaciones as observations, r.admin_note as adminNote 
          FROM reserva r
          LEFT JOIN espacio e ON r.id_espacio = e.id_espacio
          LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
          ORDER BY r.fecha_registro DESC";

$stmt = $conexion->prepare($query);
$stmt->execute();

$reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($reservas);
?>
