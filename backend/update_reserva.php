<?php
// backend/update_reserva.php
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

if(!empty($data->id) && !empty($data->status)) {
    
    // Si la ID es "approveAll" es un comando especial para aprobar todas las pendientes
    if ($data->id === "approveAll") {
        $query = "UPDATE reserva SET estado = 'Aprobada' WHERE estado = 'Pendiente' OR estado = 'En revision'";
        $stmt = $conexion->prepare($query);
    } else {
        // Quitamos el prefijo r- usado en las pruebas
        $id_limpio = str_replace("r-", "", $data->id);
        
        $admin_note = isset($data->adminNote) ? $data->adminNote : null;

        if ($admin_note !== null) {
            $query = "UPDATE reserva SET estado = :estado, admin_note = :admin_note WHERE id_reserva = :id_reserva";
            $stmt = $conexion->prepare($query);
            $stmt->bindParam(':admin_note', $admin_note);
        } else {
            $query = "UPDATE reserva SET estado = :estado WHERE id_reserva = :id_reserva";
            $stmt = $conexion->prepare($query);
        }

        $stmt->bindParam(':estado', $data->status);
        $stmt->bindParam(':id_reserva', $id_limpio);
    }
    
    if($stmt->execute()) {
        echo json_encode(["message" => "Reserva(s) actualizada(s)."]);
    } else {
        echo json_encode(["error" => "Error al actualizar."]);
    }
} else {
    echo json_encode(["error" => "Datos incompletos."]);
}
?>
