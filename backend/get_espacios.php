<?php
// backend/get_espacios.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexion.php';

// Seleccionamos los espacios adaptando los nombres de columnas a lo que espera React Native
$query = "SELECT id_espacio as id, nombre as name, capacidad as capacity, 0 as occupied FROM espacio"; 
$stmt = $conexion->prepare($query);
$stmt->execute();

$espacios = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($espacios);
?>
