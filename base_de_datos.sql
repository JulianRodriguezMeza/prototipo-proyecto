-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema gestionespacios
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gestionespacios` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `gestionespacios` ;

-- -----------------------------------------------------
-- Table `gestionespacios`.`dependecia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`dependecia` (
  `id_dependecia` INT NOT NULL,
  `nombre_dependencia` VARCHAR(45) NULL,
  PRIMARY KEY (`id_dependecia`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestionespacios`.`tipo_actividad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`tipo_actividad` (
  `id_tipo_actividad` INT NOT NULL,
  `nombre_tipo` VARCHAR(45) NOT NULL,
  `dependecia_id_dependecia` INT NOT NULL,
  PRIMARY KEY (`id_tipo_actividad`),
  INDEX `fk_tipo_actividad_dependecia1_idx` (`dependecia_id_dependecia` ASC),
  CONSTRAINT `fk_tipo_actividad_dependecia1`
    FOREIGN KEY (`dependecia_id_dependecia`)
    REFERENCES `gestionespacios`.`dependecia` (`id_dependecia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestionespacios`.`actividad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`actividad` (
  `id_actividad` INT NOT NULL AUTO_INCREMENT,
  `descripcion` TEXT NOT NULL,
  `nombre_actividad` VARCHAR(45) NULL,
  `numero_estudiantes` INT NULL,
  `tipo_actividad_id_tipo_actividad` INT NOT NULL,
  PRIMARY KEY (`id_actividad`),
  INDEX `fk_actividad_tipo_actividad1_idx` (`tipo_actividad_id_tipo_actividad` ASC),
  CONSTRAINT `fk_actividad_tipo_actividad1`
    FOREIGN KEY (`tipo_actividad_id_tipo_actividad`)
    REFERENCES `gestionespacios`.`tipo_actividad` (`id_tipo_actividad`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`tipo_espacio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`tipo_espacio` (
  `idtipo_espacio` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idtipo_espacio`),
  UNIQUE INDEX `tipo_UNIQUE` (`tipo` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`espacio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`espacio` (
  `id_espacio` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `ubicacion` VARCHAR(100) NOT NULL,
  `capacidad` INT NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `idtipo_espacio` INT NOT NULL,
  PRIMARY KEY (`id_espacio`),
  INDEX `fk_espacio_tipo_espacio1_idx` (`idtipo_espacio` ASC),
  CONSTRAINT `fk_espacio_tipo_espacio1`
    FOREIGN KEY (`idtipo_espacio`)
    REFERENCES `gestionespacios`.`tipo_espacio` (`idtipo_espacio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`equipos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`equipos` (
  `id_equipo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `id_espacio` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_equipo`),
  INDEX `id_espacio_idx` (`id_espacio` ASC),
  CONSTRAINT `equipos_ibfk_1`
    FOREIGN KEY (`id_espacio`)
    REFERENCES `gestionespacios`.`espacio` (`id_espacio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido` VARCHAR(50) NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `correo` (`correo` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`asistencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`asistencia` (
  `id_asistencia` INT NOT NULL,
  `asistio` VARCHAR(45) NOT NULL,
  `verifica` VARCHAR(45) NOT NULL,
  `usuario_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_asistencia`),
  INDEX `fk_asistencia_usuario1_idx` (`usuario_id_usuario` ASC),
  CONSTRAINT `fk_asistencia_usuario1`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestionespacios`.`reserva`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`reserva` (
  `id_reserva` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `fecha_registro` DATETIME NOT NULL,
  `estado` VARCHAR(45) NOT NULL,
  `id_actividad` INT NOT NULL,
  `id_espacio` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `fecha_reserva` VARCHAR(100) NULL,
  `observaciones` TEXT NULL,
  `admin_note` TEXT NULL,
  `asistencia_id_asistencia` INT NOT NULL,
  PRIMARY KEY (`id_reserva`),
  UNIQUE INDEX `codigo_UNIQUE` (`codigo` ASC),
  INDEX `id_usuario_idx` (`id_usuario` ASC),
  INDEX `id_espacio_idx` (`id_espacio` ASC),
  INDEX `id_actividad_idx` (`id_actividad` ASC),
  INDEX `fk_reserva_asistencia1_idx` (`asistencia_id_asistencia` ASC),
  CONSTRAINT `reserva_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`),
  CONSTRAINT `reserva_ibfk_2`
    FOREIGN KEY (`id_espacio`)
    REFERENCES `gestionespacios`.`espacio` (`id_espacio`),
  CONSTRAINT `reserva_ibfk_3`
    FOREIGN KEY (`id_actividad`)
    REFERENCES `gestionespacios`.`actividad` (`id_actividad`),
  CONSTRAINT `fk_reserva_asistencia1`
    FOREIGN KEY (`asistencia_id_asistencia`)
    REFERENCES `gestionespacios`.`asistencia` (`id_asistencia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`notificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`notificacion` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `mensaje` TEXT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `leido` TINYINT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_reserva` INT NOT NULL,
  PRIMARY KEY (`id_notificacion`),
  INDEX `id_usuario_idx` (`id_usuario` ASC),
  INDEX `id_reserva_idx` (`id_reserva` ASC),
  CONSTRAINT `notificacion_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`),
  CONSTRAINT `notificacion_ibfk_2`
    FOREIGN KEY (`id_reserva`)
    REFERENCES `gestionespacios`.`reserva` (`id_reserva`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`registro_acceso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`registro_acceso` (
  `id_acceso` INT NOT NULL AUTO_INCREMENT,
  `fecha_hora` DATETIME NOT NULL,
  `validacion` VARCHAR(50) NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_espacio` INT NOT NULL,
  PRIMARY KEY (`id_acceso`),
  INDEX `id_usuario_idx` (`id_usuario` ASC),
  INDEX `id_espacio_idx` (`id_espacio` ASC),
  CONSTRAINT `registro_acceso_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`),
  CONSTRAINT `registro_acceso_ibfk_2`
    FOREIGN KEY (`id_espacio`)
    REFERENCES `gestionespacios`.`espacio` (`id_espacio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`reporte_falla`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`reporte_falla` (
  `id_reporte` INT NOT NULL AUTO_INCREMENT,
  `descripcion` TEXT NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `fecha` DATE NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_equipo` INT NOT NULL,
  `prioridad` VARCHAR(45) NULL,
  PRIMARY KEY (`id_reporte`),
  INDEX `id_usuario_idx` (`id_usuario` ASC),
  INDEX `id_equipo_idx` (`id_equipo` ASC),
  CONSTRAINT `reporte_falla_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`),
  CONSTRAINT `reporte_falla_ibfk_2`
    FOREIGN KEY (`id_equipo`)
    REFERENCES `gestionespacios`.`equipos` (`id_equipo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`tipo_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`tipo_usuario` (
  `id_tipo_usuario` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(50) NOT NULL,
  `roles_id_roles` INT NOT NULL,
  PRIMARY KEY (`id_tipo_usuario`, `roles_id_roles`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`usuario_rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`usuario_rol` (
  `usuario_id_usuario` INT NOT NULL,
  `tipo_usuario_id_tipo_usuario` INT NOT NULL,

  PRIMARY KEY (`usuario_id_usuario`, `tipo_usuario_id_tipo_usuario`),
  INDEX `fk_usuario_has_tipo_usuario_tipo_usuario1_idx` (`tipo_usuario_id_tipo_usuario` ASC),
  INDEX `fk_usuario_has_tipo_usuario_usuario1_idx` (`usuario_id_usuario` ASC),
  CONSTRAINT `fk_usuario_has_tipo_usuario_usuario1`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario_has_tipo_usuario_tipo_usuario1`
    FOREIGN KEY (`tipo_usuario_id_tipo_usuario`)
    REFERENCES `gestionespacios`.`tipo_usuario` (`id_tipo_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `gestionespacios`.`bitacora`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`bitacora` (
  `id_bitacora` INT NOT NULL,
  `Fecha` DATETIME NULL,
  `Accion` VARCHAR(50) NULL,
  `usuario_id_usuario` INT NOT NULL,
  `espacio_id_espacio` INT NOT NULL,
  PRIMARY KEY (`id_bitacora`),
  INDEX `fk_bitacora_usuario1_idx` (`usuario_id_usuario` ASC),
  INDEX `fk_bitacora_espacio1_idx` (`espacio_id_espacio` ASC),
  CONSTRAINT `fk_bitacora_usuario1`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `gestionespacios`.`usuario` (`id_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_bitacora_espacio1`
    FOREIGN KEY (`espacio_id_espacio`)
    REFERENCES `gestionespacios`.`espacio` (`id_espacio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestionespacios`.`Horario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestionespacios`.`Horario` (
  `id_Horario` INT NOT NULL,
  `dia_semana` VARCHAR(45) NULL,
  `Hora_inicio` TIME NULL,
  `Hora_Final` TIME NULL,
  `Horariocol` VARCHAR(45) NULL,
  `Disponibible` TINYINT NULL,
  `espacio_id_espacio` INT NOT NULL,
  PRIMARY KEY (`id_Horario`),
  INDEX `fk_Horario_espacio1_idx` (`espacio_id_espacio` ASC),
  CONSTRAINT `fk_Horario_espacio1`
    FOREIGN KEY (`espacio_id_espacio`)
    REFERENCES `gestionespacios`.`espacio` (`id_espacio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
