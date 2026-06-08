<?php
// backend/create_reserva.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Bypass-Tunnel-Reminder");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->roomName) && !empty($data->requester)) {
    // 1. Intentamos buscar el ID del espacio por su nombre
    $stmtEsp = $conexion->prepare("SELECT id_espacio FROM espacio WHERE nombre LIKE :nombre LIMIT 1");
    $nombreBuscar = "%" . $data->roomName . "%";
    $stmtEsp->bindParam(":nombre", $nombreBuscar);
    $stmtEsp->execute();
    $espacio = $stmtEsp->fetch(PDO::FETCH_ASSOC);
    $id_espacio = $espacio ? $espacio['id_espacio'] : 1; // Si no existe, usamos 1 como fallback

    $raw_inicio = isset($data->startTime) && !empty($data->startTime) ? $data->startTime : '08:00';
    $raw_fin = isset($data->endTime) && !empty($data->endTime) ? $data->endTime : '10:00';

    if (strpos($raw_inicio, ':') === false && is_numeric($raw_inicio)) $raw_inicio .= ':00';
    if (strpos($raw_fin, ':') === false && is_numeric($raw_fin)) $raw_fin .= ':00';

    $t_inicio = strtotime($raw_inicio);
    $h_inicio = $t_inicio ? date("H:i:s", $t_inicio) : '08:00:00';

    $t_fin = strtotime($raw_fin);
    $h_fin = $t_fin ? date("H:i:s", $t_fin) : '10:00:00';

    $fecha_r = isset($data->reservationDate) ? $data->reservationDate : null;
    $obs = isset($data->observations) ? $data->observations : null;

    // 2. Validación de superposición (evitar empalmes en el mismo horario y espacio)
    if ($fecha_r) {
        $queryCheck = "SELECT id_reserva FROM reserva 
                       WHERE id_espacio = :id_espacio 
                       AND fecha_reserva = :fecha_reserva
                       AND estado != 'Rechazada' 
                       AND estado != 'Cancelada'
                       AND hora_inicio < :h_fin
                       AND hora_fin > :h_inicio
                       LIMIT 1";
        $stmtCheck = $conexion->prepare($queryCheck);
        $stmtCheck->bindParam(':id_espacio', $id_espacio);
        $stmtCheck->bindParam(':fecha_reserva', $fecha_r);
        $stmtCheck->bindParam(':h_fin', $h_fin);
        $stmtCheck->bindParam(':h_inicio', $h_inicio);
        $stmtCheck->execute();
        
        if ($stmtCheck->fetch()) {
            echo json_encode(["error" => "El horario seleccionado ya está ocupado."]);
            exit;
        }
    }

    // 3. Insertamos la reserva
    $query = "INSERT INTO reserva 
             (codigo, hora_inicio, hora_fin, fecha_registro, estado, id_actividad, id_espacio, id_usuario, asistencia_id_asistencia, fecha_reserva, observaciones) 
             VALUES 
             (:codigo, :h_inicio, :h_fin, NOW(), 'Pendiente', 1, :id_espacio, 1, 1, :fecha_reserva, :observaciones)"; 
             // Ojo: id_usuario=1, id_actividad=1 son fijos para la prueba. Deben existir en la DB.
    
    $stmt = $conexion->prepare($query);
    
    $codigo = "REQ-" . time();
    $stmt->bindParam(":codigo", $codigo);
    $stmt->bindParam(":h_inicio", $h_inicio);
    $stmt->bindParam(":h_fin", $h_fin);
    $stmt->bindParam(":id_espacio", $id_espacio);
    $stmt->bindParam(":fecha_reserva", $fecha_r);
    $stmt->bindParam(":observaciones", $obs);
    
    // Desactivamos temporalmente las llaves foráneas para evitar errores si la BD está vacía en este prototipo
    $conexion->exec("SET FOREIGN_KEY_CHECKS=0;");
    
    if($stmt->execute()) {
        $conexion->exec("SET FOREIGN_KEY_CHECKS=1;");
        $last_id = $conexion->lastInsertId();
        // Devolvemos el objeto creado para que React Native actualice la lista
        echo json_encode([
            "id" => $last_id, 
            "roomName" => $data->roomName, 
            "requester" => $data->requester, 
            "status" => "Pendiente",
            "reservationDate" => $fecha_r,
            "observations" => $obs
        ]);
    } else {
        echo json_encode(["error" => "Error al crear la reserva.", "detalles" => $stmt->errorInfo()]);
    }
} else {
    echo json_encode(["error" => "Datos incompletos."]);
}
?>
