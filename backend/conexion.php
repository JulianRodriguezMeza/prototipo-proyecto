<?php
// backend/conexion.php
$host = "localhost";
$db_name = "gestionespacios";
$username = "root"; // Usuario por defecto en XAMPP
$password = ""; // Contraseña por defecto en XAMPP suele estar vacía

try {
    $conexion = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo "Error de conexión: " . $exception->getMessage();
    exit;
}
?>
