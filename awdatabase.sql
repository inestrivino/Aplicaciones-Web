-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 07-12-2025 a las 23:23:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `concesionarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL UNIQUE,
  `ciudad` varchar(50) NOT NULL,
  `direccion` varchar(50) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `latitud` DECIMAL(10,8),
  `longitud` DECIMAL(11,8),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `rol` varchar(10) NOT NULL,
  `id_concesionario` int(11) NOT NULL,
  `accesibilidad` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),

  CONSTRAINT fk_users_concesionario
    FOREIGN KEY (`id_concesionario`)
    REFERENCES concesionarios(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vehiculos` (
  `matricula` varchar(20) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `plazas` int(11) NOT NULL,
  `autonomia` int(11) NOT NULL,
  `color` varchar(50) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `id_concesionario` int(11) NOT NULL,
  `kilometros` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`matricula`),
  
  CONSTRAINT fk_vehiculos_concesionario
    FOREIGN KEY (`id_concesionario`)
    REFERENCES concesionarios(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `fecha_ini` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),

  CONSTRAINT fk_reservas_usuario
    FOREIGN KEY (`id_usuario`)
    REFERENCES users(`id`)
    ON DELETE CASCADE,

  CONSTRAINT fk_reservas_vehiculo
    FOREIGN KEY (`matricula`)
    REFERENCES vehiculos(`matricula`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `feedback` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `id_reserva` int(11) NOT NULL UNIQUE,
  `comentario` VARCHAR(200),
  `puntuacion` int(11) NOT NULL,

  CONSTRAINT fk_reserva_feedback
    FOREIGN KEY (`id_reserva`)
    REFERENCES reservas(`id`)
    ON DELETE CASCADE,

  CONSTRAINT chk_puntuacion
    CHECK (`puntuacion` BETWEEN 1 AND 5)
);

CREATE TABLE `incidentes` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `matricula` varchar(20) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `comentario` VARCHAR(200),
  `fecha` date,

  CONSTRAINT fk_incidente_usuario
    FOREIGN KEY (`id_usuario`)
    REFERENCES users(`id`)
    ON DELETE CASCADE,

  CONSTRAINT fk_incidente_matricula
    FOREIGN KEY (`matricula`)
    REFERENCES vehiculos(`matricula`)
    ON DELETE CASCADE
);

CREATE TABLE `alertas` (
  `id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `texto` varchar(200) NOT NULL,
  `fecha` date NOT NULL,
  `vista` boolean NOT NULL,

  CONSTRAINT fk_alerta_usuario
    FOREIGN KEY (`id_usuario`)
    REFERENCES users(`id`)
    ON DELETE CASCADE,

  CONSTRAINT fk_alerta_matricula
    FOREIGN KEY (`matricula`)
    REFERENCES vehiculos(`matricula`)
    ON DELETE CASCADE,
  
  CONSTRAINT fk_alerta_reserva
    FOREIGN KEY (`id_reserva`)
    REFERENCES reservas(`id`)
    ON DELETE CASCADE
);

INSERT INTO `concesionarios` (`id`, `nombre`, `ciudad`, `direccion`, `telefono`) VALUES
(1, 'Concesionario Central', 'Madrid', 'Calle Gran Via 1', '912345678');

INSERT INTO `users` (`id`, `name`, `email`, `password`, `rol`, `id_concesionario`, `accesibilidad`) VALUES
(1, 'Admin', 'admin@ucm.es', '$2b$10$w5JZSprvOSIi9eZEzakfuurP0F1ikssdVb2DSC5T0UGmjoT92mkj2', 'admin', 1, NULL);

COMMIT;